const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

module.exports = function createAuthRouter(pool) {
  const router = express.Router();

  function authenticate(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "BANZA WINJIRE MURI KONTI YAWE."
      });
    }

    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({
        success: false,
        message: "TOKEN NTIKIRIYO CYANGWA YARANGIYE IGIHE."
      });
    }
  }

  function requireAdmin(req, res, next) {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "IKI GIKORWA CYEMEREWE ADMIN GUSA."
      });
    }

    next();
  }

  // ADMIN ACTIVITY LOGGER
  async function logAdminActivity(adminUserId, targetUserId, action, details = {}) {
    try {
      await pool.query(`
        INSERT INTO admin_activity_logs
          (admin_user_id, target_user_id, action, details)
        VALUES ($1, $2, $3, $4::jsonb)
      `, [
        adminUserId,
        targetUserId,
        action,
        JSON.stringify(details)
      ]);
    } catch (error) {
      console.error("ADMIN ACTIVITY LOG ERROR:", error.message);
    }
  }
  // LOGIN
  router.post("/auth/login", async (req, res) => {
    try {
      const phone = String(req.body.phone || "").trim();
      const password = String(req.body.password || "");

      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          message: "ANDIKAMO TELEFONI N'IJAMBO RY'IBANGA."
        });
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET ntabwo iri muri environment.");
      }

      const result = await pool.query(`
        SELECT id, full_name, phone, password_hash,
               role, is_active, farmer_id, umuhuza_id
        FROM users
        WHERE phone = $1
        LIMIT 1
      `, [phone]);

      if (!result.rows.length) {
        return res.status(401).json({
          success: false,
          message: "TELEFONI CYANGWA IJAMBO RY'IBANGA SI BYO."
        });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: "IYI KONTI YAHAGARITSWE. VUGISHA ADMIN."
        });
      }

      const validPassword = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "TELEFONI CYANGWA IJAMBO RY'IBANGA SI BYO."
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          phone: user.phone,
          role: user.role,
          farmer_id: user.farmer_id,
          umuhuza_id: user.umuhuza_id
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return res.json({
        success: true,
        message: "WINJIYE NEZA.",
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          farmer_id: user.farmer_id,
          umuhuza_id: user.umuhuza_id
        }
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "KWINJIRA BYANZE."
      });
    }
  });


// PUBLIC REGISTRATION
router.post("/auth/register", async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const fullName = String(req.body.full_name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "").trim().toUpperCase();

    const profile = {
      province: String(req.body.province || "").trim(),
      district: String(req.body.district || "").trim(),
      sector: String(req.body.sector || "").trim(),
      cell: String(req.body.cell || "").trim(),
      village: String(req.body.village || "").trim()
    };

    if (!fullName || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "UZUZA AMAZINA, TELEFONI, PASSWORD NA ROLE."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "PASSWORD IGOMBA KUBA NIBURA INYUGUTI 8."
      });
    }

    if (!["UMUHINZI", "UMWOROZI", "UMUGUZI", "UMUHUZA"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "UBWOKO BWA KONTI NTIBWEMEWE."
      });
    }

    if (role === "UMUHUZA" &&
        Object.values(profile).some(value => !value)) {
      return res.status(400).json({
        success: false,
        message: "UMUHUZA AGOMBA KUZUZA AHO AKORERA."
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    let farmerId = null;
    let umuhuzaId = null;

    if (role === "UMUHINZI" || role === "UMWOROZI") {
      // Reba niba telefoni isanzwe ifite konti
      const existingUser = await client.query(
        `SELECT id FROM users
         WHERE phone = $1
         LIMIT 1`,
        [phone]
      );

      if (existingUser.rows.length) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          success: false,
          message: "IYI TELEFONI ISANZWE IFITE KONTI. Koresha indi telefoni cyangwa winjire muri konti yawe."
        });
      }

      // Buri konti nshya ihabwa umwirondoro wayo
      const farmer = await client.query(
        `INSERT INTO farmers (farmer_name, phone)
         VALUES ($1, $2)
         RETURNING id`,
        [fullName, phone]
      );

      farmerId = farmer.rows[0].id;
    }

    if (role === "UMUHUZA") {
      const code = "UMH-" +
        Date.now() + "-" +
        crypto.randomBytes(3).toString("hex").toUpperCase();

      const intermediary = await client.query(`
        INSERT INTO umuhuza (
          umuhuza_code, name, phone,
          province, district, sector, cell, village
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        code, fullName, phone,
        profile.province, profile.district,
        profile.sector, profile.cell, profile.village
      ]);

      umuhuzaId = intermediary.rows[0].id;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const created = await client.query(`
      INSERT INTO users (
        full_name, phone, password_hash,
        role, farmer_id, umuhuza_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, phone, role,
                is_active, farmer_id, umuhuza_id
    `, [
      fullName, phone, passwordHash,
      role, farmerId, umuhuzaId
    ]);

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "KONTI YAKOZWE NEZA. USHOBORA KWINJIRA.",
      user: created.rows[0]
    });

  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "IYI TELEFONI ISANZWE IKORESHWA N'INDI KONTI."
      });
    }

    console.error("PUBLIC REGISTRATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "GUKORA KONTI BYANZE."
    });

  } finally {
    client.release();
  }
});
  // CURRENT USER
  router.get("/auth/me", authenticate, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, full_name, phone, role,
               is_active, farmer_id, umuhuza_id
        FROM users
        WHERE id = $1
      `, [req.user.id]);

      if (!result.rows.length || !result.rows[0].is_active) {
        return res.status(401).json({
          success: false,
          message: "KONTI NTIBONEKA CYANGWA YAHAGARITSWE."
        });
      }

      return res.json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error("AUTH ME ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "KUGENZURA KONTI BYANZE."
      });
    }
  });

  // UMUHUZA PROFILE - CURRENT LOGGED-IN USER ONLY
  router.get("/umuhuza/me", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "UMUHUZA" || !req.user.umuhuza_id) {
        return res.status(403).json({
          success: false,
          message: "NTEMEREWE KUBONA UMWIRONDORO WA UMUHUZA."
        });
      }

      const result = await pool.query(`
        SELECT id, umuhuza_code, name, phone, picture,
               province, district, sector, cell, village
        FROM umuhuza
        WHERE id = $1
        LIMIT 1
      `, [req.user.umuhuza_id]);

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "UMWIRONDORO WAWE NTUBONETSE."
        });
      }

      return res.json({
        success: true,
        profile: result.rows[0]
      });
    } catch (error) {
      console.error("UMUHUZA PROFILE ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "KUBONA UMWIRONDORO BYANZE."
      });
    }
  });

  // ADMIN ROUTES
  router.use("/admin", authenticate, requireAdmin);

  // LIST FARMERS
  router.get("/admin/farmers", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT f.id, f.farmer_name, f.phone,
               COUNT(p.id)::int AS products_count,
               EXISTS (
                 SELECT 1 FROM users u
                 WHERE u.farmer_id = f.id
               ) AS has_account
        FROM farmers f
        LEFT JOIN products p ON p.farmer_id = f.id
        GROUP BY f.id, f.farmer_name, f.phone
        ORDER BY f.farmer_name
      `);

      return res.json({
        success: true,
        farmers: result.rows
      });
    } catch (error) {
      console.error("ADMIN FARMERS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "KUBONA ABAHINZI BYANZE."
      });
    }
  });

  // LIST USERS
  router.get("/admin/users", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          u.id, u.full_name, u.phone, u.role,
          u.is_active, u.farmer_id, u.umuhuza_id,
          u.created_at,
          f.farmer_name,
          m.umuhuza_code,
          m.name AS umuhuza_name
        FROM users u
        LEFT JOIN farmers f ON f.id = u.farmer_id
        LEFT JOIN umuhuza m ON m.id = u.umuhuza_id
        ORDER BY u.created_at DESC
      `);

      return res.json({
        success: true,
        users: result.rows
      });
    } catch (error) {
      console.error("ADMIN USERS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "KUBONA KONTI BYANZE."
      });
    }
  });

  // CREATE USER
  router.post("/admin/users", async (req, res) => {
    const client = await pool.connect();

    try {
      const fullName = String(req.body.full_name || "").trim();
      const phone = String(req.body.phone || "").trim();
      const password = String(req.body.password || "");
      const role = String(req.body.role || "").trim().toUpperCase();

      if (!fullName || !phone || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "UZUZA AMAZINA, TELEFONI, PASSWORD NA ROLE."
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "PASSWORD IGOMBA KUBA NIBURA INYUGUTI 8."
        });
      }

      if (!["ADMIN", "UMUHINZI", "UMUHUZA", "UMUGUZI"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "ROLE SIYO."
        });
      }

      const farmerId = role === "UMUHINZI"
        ? Number(req.body.farmer_id)
        : null;

      if (role === "UMUHINZI" &&
          (!Number.isInteger(farmerId) || farmerId <= 0)) {
        return res.status(400).json({
          success: false,
          message: "HITAMO UMUHINZI UHUZA N'IYI KONTI."
        });
      }

      const profile = {
        province: String(req.body.province || "").trim(),
        district: String(req.body.district || "").trim(),
        sector: String(req.body.sector || "").trim(),
        cell: String(req.body.cell || "").trim(),
        village: String(req.body.village || "").trim()
      };

      if (role === "UMUHUZA" &&
          Object.values(profile).some(value => !value)) {
        return res.status(400).json({
          success: false,
          message: "UZUZA INTARA, AKARERE, UMURENGE, AKAGARI N'UMUDUGUDU BY'UMUHUZA."
        });
      }

      await client.query("BEGIN");

      let umuhuzaId = null;

      if (role === "UMUHINZI") {
        const farmer = await client.query(
          "SELECT id FROM farmers WHERE id = $1",
          [farmerId]
        );

        if (!farmer.rows.length) {
          await client.query("ROLLBACK");
          return res.status(404).json({
            success: false,
            message: "UMUHINZI NTABONETSE."
          });
        }

        const linked = await client.query(
          "SELECT id FROM users WHERE farmer_id = $1",
          [farmerId]
        );

        if (linked.rows.length) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            success: false,
            message: "UYU MUHINZI ASANZWE AFITE KONTI."
          });
        }
      }

      if (role === "UMUHUZA") {
        const code = "UMH-" +
          Date.now() + "-" +
          crypto.randomBytes(3).toString("hex").toUpperCase();

        const intermediary = await client.query(`
          INSERT INTO umuhuza (
            umuhuza_code, name, phone,
            province, district, sector, cell, village
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
        `, [
          code, fullName, phone,
          profile.province, profile.district,
          profile.sector, profile.cell, profile.village
        ]);

        umuhuzaId = intermediary.rows[0].id;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const created = await client.query(`
        INSERT INTO users (
          full_name, phone, password_hash,
          role, farmer_id, umuhuza_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, full_name, phone, role,
                  is_active, farmer_id, umuhuza_id
      `, [
        fullName, phone, passwordHash,
        role, farmerId, umuhuzaId
      ]);

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "KONTI YAKOZWE NEZA.",
        user: created.rows[0]
      });
    } catch (error) {
      await client.query("ROLLBACK");

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "IYI TELEFONI ISANZWE IKORESHWA N'INDI KONTI."
        });
      }

      console.error("CREATE USER ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "GUKORA KONTI BYANZE."
      });
    } finally {
      client.release();
    }
  });

  // VIEW ACCOUNT ACTIVITY
  router.get("/admin/users/:id/activity", async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID YA KONTI SI YO."
        });
      }

      const result = await pool.query(`
        SELECT
          l.id,
          l.admin_user_id,
          a.full_name AS admin_name,
          l.target_user_id,
          l.action,
          l.details,
          l.created_at
        FROM admin_activity_logs l
        LEFT JOIN users a ON a.id = l.admin_user_id
        WHERE l.target_user_id = $1
        ORDER BY l.created_at DESC
        LIMIT 100
      `, [id]);

      return res.json({
        success: true,
        activities: result.rows
      });
    } catch (error) {
      console.error("GET ACCOUNT ACTIVITY ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "KUREBA AMATEKA YA KONTI BYANZE."
      });
    }
  });
  // ADMIN RESET USER PASSWORD
  router.post("/admin/users/:id/reset-password", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { new_password } = req.body;

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "ID YA KONTI SI YO."
        });
      }

      if (typeof new_password !== "string" || new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "PASSWORD IGOMBA KUBA NIBURA INYUGUTI 8."
        });
      }

      const account = await pool.query(
        "SELECT id, full_name, phone FROM users WHERE id = $1",
        [id]
      );

      if (account.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "KONTI NTIBONETSE."
        });
      }

      const passwordHash = await bcrypt.hash(new_password, 12);

      await pool.query(
        "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
        [passwordHash, id]
      );

      await logAdminActivity(
        req.user.id,
        id,
        "RESET_PASSWORD",
        {
          full_name: account.rows[0].full_name,
          phone: account.rows[0].phone
        }
      );

      return res.json({
        success: true,
        message: "PASSWORD NSHYA YAKOZWE NEZA."
      });
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "GUSUBIRAMO PASSWORD BYANZE."
      });
    }
  });
  // ACTIVATE / DEACTIVATE USER
  router.patch("/admin/users/:id/status", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const isActive = req.body.is_active;

      if (!Number.isInteger(id) || id <= 0 ||
          typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "AMAKURU ATANGIWE SI YO."
        });
      }

      if (id === Number(req.user.id) && !isActive) {
        return res.status(400).json({
          success: false,
          message: "NTUSHOBORA GUHAGARIKA KONTI URIMO."
        });
      }

      if (!isActive) {
        const target = await pool.query(
          "SELECT role, is_active FROM users WHERE id = $1",
          [id]
        );

        if (!target.rows.length) {
          return res.status(404).json({
            success: false,
            message: "KONTI NTIBONETSE."
          });
        }

        if (target.rows[0].role === "ADMIN" &&
            target.rows[0].is_active) {
          const admins = await pool.query(`
            SELECT COUNT(*)::int AS total
            FROM users
            WHERE role = 'ADMIN' AND is_active = TRUE
          `);

          if (admins.rows[0].total <= 1) {
            return res.status(400).json({
              success: false,
              message: "NTUSHOBORA GUHAGARIKA ADMIN WA NYUMA UKORA."
            });
          }
        }
      }

      const result = await pool.query(`
        UPDATE users
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, full_name, phone, role, is_active
      `, [isActive, id]);

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "KONTI NTIBONETSE."
        });
      }

      await logAdminActivity(
        req.user.id,
        id,
        isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
        { full_name: result.rows[0].full_name, phone: result.rows[0].phone }
      );

      return res.json({
        success: true,
        message: isActive
          ? "KONTI YONGEYE GUKORA."
          : "KONTI YAHAGARITSWE.",
        user: result.rows[0]
      });
    } catch (error) {
      console.error("UPDATE USER STATUS ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "GUHINDURA IMIMERERE YA KONTI BYANZE."
      });
    }
  });

  return router;
};




