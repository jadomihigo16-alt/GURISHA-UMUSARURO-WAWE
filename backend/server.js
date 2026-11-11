
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");
const path = require("path");
const multer = require("multer");
const createAuthRouter = require("./auth.routes");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
const uploadFolder = path.join(__dirname, "uploads", "products");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /^(image\/(jpeg|png|webp|gif)|video\/mp4|video\/webm|video\/quicktime)$/;
    if (allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hitamo ifoto cyangwa video yemerewe."));
    }
  },
});

app.use("/uploads", express.static(uploadFolder));
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});
app.use("/api", createAuthRouter(pool));

// JWT AUTHENTICATION FOR ORDER STATUS
function authenticateOrderUser(req, res, next) {
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
const soldSchemaReady = pool.query(`
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_sold BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offered_price NUMERIC,
  ADD COLUMN IF NOT EXISTS offer_status TEXT NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS offer_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offer_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_reason TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resale_price NUMERIC
`);

// TEST
app.get("/", (req, res) => {
  res.json({
    message: "GURISHA UMUSARURO WAWE BACKEND IRIMO GUKORA",
  });
});

// DATABASE HEALTH
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");

    res.json({
      success: true,
      message: "BACKEND NA DATABASE BIRAKORA",
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "DATABASE NTABWO YAHUJWE NA BACKEND",
    });
  }
});


// MARK PRODUCT AS SOLD
app.post("/api/products/:id/sold", async (req, res) => {
  try {
    await soldSchemaReady;
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "ID si yo." });
    }

    const result = await pool.query(`
      UPDATE products
      SET is_sold = TRUE, sold_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Umusaruro ntiwabonetse." });
    }

    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    console.error("KUGARAGAZA KO WAGURISHIJWE:", error);
    res.status(500).json({ success: false, message: "Ntibyashobotse." });
  }
});
// INTERMEDIARY MAKES A PRICE OFFER
app.post("/api/products/:id/offer", async (req, res) => {
  try {
    await soldSchemaReady;

    const id = Number(req.params.id);
    const offeredPrice = Number(req.body.offeredPrice);

    if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(offeredPrice) || offeredPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID cyangwa igiciro si byo."
      });
    }

    const result = await pool.query(`
      UPDATE products
      SET offered_price = $1,
          offer_status = 'PENDING',
          offer_created_at = NOW(),
          offer_response_at = NULL
      WHERE id = $2
        AND is_sold = FALSE
      RETURNING *
    `, [offeredPrice, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Umusaruro ntiwabonetse cyangwa waragurishijwe."
      });
    }

    res.json({
      success: true,
      message: "IGICIRO CYOHEREJWE KU MUHINZI.",
      product: result.rows[0]
    });
  } catch (error) {
    console.error("PRICE OFFER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "KOHEREZA IGICIRO BYANZE."
    });
  }
});

// FARMER ACCEPTS OR REJECTS THE OFFER
app.post("/api/products/:id/offer-response", async (req, res) => {
  try {
    await soldSchemaReady;

    const id = Number(req.params.id);
    const response = String(req.body.response || "").trim().toUpperCase();

    if (!Number.isInteger(id) || id <= 0 ||
        !["ACCEPTED", "REJECTED"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Igisubizo cyangwa ID si byo."
      });
    }

    const result = await pool.query(`
      UPDATE products
      SET offer_status = $1,
          offer_response_at = NOW()
      WHERE id = $2
        AND offered_price IS NOT NULL
        AND offer_status = 'PENDING'
        AND is_sold = FALSE
      RETURNING *
    `, [response, id]);

    if (result.rowCount === 0) {
      return res.status(409).json({
        success: false,
        message: "Nta giciro gitegereje igisubizo kuri uyu musaruro."
      });
    }

    res.json({
      success: true,
      message: response === "ACCEPTED"
        ? "UMUHINZI YEMEYE IGICIRO."
        : "UMUHINZI YANZE IGICIRO.",
      product: result.rows[0]
    });
  } catch (error) {
    console.error("PRICE OFFER RESPONSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "KUBIKA IGISUBIZO BYANZE."
    });
  }
});
// VERIFY PRODUCT
app.post("/api/products/:id/verify", async (req, res) => {
  try {
    await soldSchemaReady;

    const id = Number(req.params.id);
    const reason = String(req.body.reason || "").trim();

    if (!Number.isInteger(id) || id <= 0 || !reason) {
      return res.status(400).json({
        success: false,
        message: "ID cyangwa impamvu si byo."
      });
    }

    const result = await pool.query(`
      UPDATE products
      SET status = 'WAGENZUWE - NTABWO WEMEJWE',
          verification_reason = $1,
          verified_at = NOW()
      WHERE id = $2
        AND is_sold = FALSE
      RETURNING *
    `, [reason, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Umusaruro ntiwabonetse cyangwa waragurishijwe."
      });
    }

    res.json({
      success: true,
      message: "UMUSARURO WAGENZUWE.",
      product: result.rows[0]
    });
  } catch (error) {
    console.error("VERIFY PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "KUGENZURA UMUSARURO BYANZE."
    });
  }
});
// APPROVE PRODUCT AND SET INTERMEDIARY RESALE PRICE
app.post("/api/products/:id/approve", async (req, res) => {
  try {
    await soldSchemaReady;

    const id = Number(req.params.id);
    const resalePrice = Number(
      String(req.body.resalePrice ?? "").replace(",", ".")
    );

    if (!Number.isInteger(id) || id <= 0 ||
        !Number.isFinite(resalePrice) || resalePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID cyangwa igiciro cyo kugurishaho si byo."
      });
    }

    const result = await pool.query(`
      UPDATE products
      SET resale_price = $1,
          status = 'WEMEJWE'
      WHERE id = $2
        AND status = 'WAGENZUWE - NTABWO WEMEJWE'
        AND offer_status = 'ACCEPTED'
        AND offered_price IS NOT NULL
        AND is_sold = FALSE
      RETURNING *
    `, [resalePrice, id]);

    if (result.rowCount === 0) {
      return res.status(409).json({
        success: false,
        message: "Umusaruro ugomba kuba wagenzuwe, umuhinzi akaba yemeye igiciro, kandi utaragurishwa."
      });
    }

    res.json({
      success: true,
      message: "UMUSARURO WEMEJWE KANDI IGICIRO CYO KUGURISHA CYABITSWE.",
      product: result.rows[0]
    });
  } catch (error) {
    console.error("APPROVE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "KWEMEZA UMUSARURO BYANZE."
    });
  }
});

// UMUHINZI ABONA UMUSARURO WE GUSA
app.get("/api/products/mine", authenticateOrderUser, async (req, res) => {
  try {
    if (!["UMUHINZI", "UMWOROZI"].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "IKI GIKORWA CYEMEREWE UMUHINZI CYANGWA UMWOROZI."
      });
    }

    const farmerId = Number(req.user?.farmer_id);

    if (!Number.isInteger(farmerId) || farmerId <= 0) {
      return res.status(403).json({
        success: false,
        message: "KONTI YAWE NTIHUJE N'UMUHINZI."
      });
    }

    const result = await pool.query(
      "SELECT * FROM products WHERE farmer_id = $1 ORDER BY id DESC",
      [farmerId]
    );

    return res.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error("GET MY PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "KUBONA UMUSARURO WANJYE BYANZE."
    });
  }
});


// UMUGUZI ABONA UMUSARURO WEMEJWE GUSA
app.get("/api/products/approved", async (req, res) => {
  try {
    await soldSchemaReady;

    const result = await pool.query(`
      SELECT *
      FROM products
      WHERE status = 'WEMEJWE'
        AND COALESCE(is_sold, FALSE) = FALSE
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error("GET APPROVED PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "KUBONA UMUSARURO WEMEJWE BYANZE."
    });
  }
});

// GET PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM products
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "KUBONA UMUSARURO BYANZE.", error: error.message,
    });
  }
});

// POST PRODUCT
app.post("/api/products", authenticateOrderUser, upload.single("media"), async (req, res) => {  let client;
  let transactionStarted = false;

  try {
    const {
      name,
      type,
      farmerName,
      farmerPhone,
      quantity,
      unit,
      price,
      province,
      district,
      sector,
      cell,
      village,
      status,
      rejectionReason,
    } = req.body;

    // VALIDATION
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Izina ry'umusaruro rirakenewe.",
      });
    }

    if (!type?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Ubwoko bw'umusaruro burakenewe.",
      });
    }

if (quantity === undefined || quantity === null || quantity === "") {
      return res.status(400).json({
        success: false,
        message: "Ingano y'umusaruro irakenewe.",
      });
    }

    if (!unit?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Igipimo kirakenewe.",
      });
    }

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Igiciro cy'umusaruro kirakenewe.",
      });
    }

    const quantityNumber = Number(quantity);
    const priceNumber = Number(price);

    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Ingano y'umusaruro ntabwo ari yo.",
      });
    }

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Igiciro cy'umusaruro ntabwo ari cyo.",
      });
    }

    const productStatus = status?.trim() || "NTABWO WAGENZUWE";

    client = await pool.connect();
    await client.query("BEGIN");
    transactionStarted = true;

    // REBA ROLE NA FARMER_ID BYA KONTI YINJIYE
if (!["UMUHINZI", "UMWOROZI"].includes(req.user?.role)) {
  await client.query("ROLLBACK");
  transactionStarted = false;

  return res.status(403).json({
    success: false,
    message: "UMUHINZI CYANGWA UMWOROZI NI WE WEMEREWE GUSHYIRA UMUSARURO KU ISOKO."
  });
}

const farmerId = Number(req.user?.farmer_id);

if (!Number.isInteger(farmerId) || farmerId <= 0) {
  await client.query("ROLLBACK");
  transactionStarted = false;

  return res.status(403).json({
    success: false,
    message: "KONTI YAWE NTIHUJE N'UMUHINZI CYANGWA UMWOROZI."
  });
}

const farmerResult = await client.query(
  `
  SELECT id, farmer_name, phone
  FROM farmers
  WHERE id = $1
  LIMIT 1
  `,
  [farmerId]
);

if (farmerResult.rows.length === 0) {
  await client.query("ROLLBACK");
  transactionStarted = false;

  return res.status(404).json({
    success: false,
    message: "KONTI YAWE NTIBONETSE MU BAHINZI CYANGWA ABOROZI."
  });
}

const cleanFarmerName = farmerResult.rows[0].farmer_name;
const cleanFarmerPhone = farmerResult.rows[0].phone;

// BIKA UMUSARURO UHURIJE NA FARMER_ID
    const productResult = await client.query(
      `
      INSERT INTO products (
        name,
        type,
        farmer_name,
        farmer_phone,
        quantity,
        unit,
        price,
        province,
        district,
        sector,
        cell,
        village,
        status,
        rejection_reason,
        farmer_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING *
      `,
      [
        name.trim(),
        type.trim(),
        cleanFarmerName,
        cleanFarmerPhone,
        quantityNumber,
        unit.trim(),
        priceNumber,
        province?.trim() || null,
        district?.trim() || null,
        sector?.trim() || null,
        cell?.trim() || null,
        village?.trim() || null,
        productStatus,
        rejectionReason?.trim() || null,
        farmerId,
      ]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    console.log("PRODUCT SAVED:", productResult.rows[0]);

    return res.status(201).json({
      success: true,
      message: "UMUSARURO WABITSWE NEZA KANDI UHURIJWE N'UMUHINZI.",
      product: productResult.rows[0],
    });
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("POST PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "KUBIKA UMUSARURO BYANZE.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// GET ORDERS
app.get("/api/orders", authenticateOrderUser, async (req, res) => {
  if (!["ADMIN", "UMUHUZA"].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "IKI GIKORWA CYEMEREWE ADMIN GUSA.",
    });
  }

  try {
    const result = await pool.query(`
      SELECT
        o.*,
        COALESCE(NULLIF(TRIM(o.farmer_name), ''), p.farmer_name) AS farmer_name,
        COALESCE(NULLIF(TRIM(o.farmer_phone), ''), p.farmer_phone) AS farmer_phone
      FROM orders o
      LEFT JOIN products p ON p.id = o.product_id
      ORDER BY o.id DESC
    `);

    res.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "KUBONA KOMANDE BYANZE.",
    });
  }
});

// // GET BUYER ORDERS BY PHONE
app.get("/api/orders/buyer/:phone", async (req, res) => {
  try {
    const phone = req.params.phone.trim();

    const result = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE buyer_phone = $1
      ORDER BY id DESC
      `,
      [phone]
    );

    res.json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    console.error("GET BUYER ORDERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "KUBONA KOMANDE Z'UMUGUZI BYANZE.",
    });
  }
});

// POST ORDER
app.post("/api/orders", async (req, res) => {
  let client;
  let transactionStarted = false;

  try {
    const {
      productId,
      productName,
      productType,
      buyerName,
      buyerPhone,
      farmerName,
      farmerPhone,
      availableQuantity,
      requestedQuantity,
      unit,
      price,
      province,
      district,
      sector,
      cell,
      village,
      buyerProvince,
      buyerDistrict,
      buyerSector,
      buyerCell,
      buyerVillage,
      status,
    } = req.body;

    if (
      !productId ||
      !productName ||
      !productType ||
      !buyerName ||
      !buyerPhone
    ) {
      return res.status(400).json({
        success: false,
        message: "Amakuru y'ingenzi ya KOMANDE arabura.",
      });
    }

    await soldSchemaReady;

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // FUNGIRA UMUSARURO ABANDI BAGUZI
    const productResult = await client.query(
      `UPDATE products
       SET is_sold = TRUE,
           sold_at = NOW()
       WHERE id = $1
         AND COALESCE(is_sold, FALSE) = FALSE
       RETURNING farmer_name, farmer_phone`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "Uyu musaruro waramaze gutumizwa cyangwa ntukiboneka.",
      });
    }

    const productFarmer = productResult.rows[0];

    const finalFarmerName =
      farmerName || productFarmer.farmer_name || null;

    const finalFarmerPhone =
      farmerPhone || productFarmer.farmer_phone || null;

    // BIKA KOMANDE
    const result = await client.query(
      `
      INSERT INTO orders (
        product_id,
        product_name,
        product_type,
        buyer_name,
        buyer_phone,
        farmer_name,
        farmer_phone,
        available_quantity,
        requested_quantity,
        unit,
        price,
        province,
        district,
        sector,
        cell,
        village,
        buyer_province,
        buyer_district,
        buyer_sector,
        buyer_cell,
        buyer_village,
        status
      )
      VALUES (
        $1, $2, $3,
        $4, $5,
        $6, $7,
        $8, $9,
        $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22
      )
      RETURNING *
      `,
      [
        productId,
        productName,
        productType,
        buyerName,
        buyerPhone,
        finalFarmerName,
        finalFarmerPhone,
        availableQuantity ?? null,
        requestedQuantity ?? null,
        unit || null,
        price ?? null,
        province || null,
        district || null,
        sector || null,
        cell || null,
        village || null,
        buyerProvince || null,
        buyerDistrict || null,
        buyerSector || null,
        buyerCell || null,
        buyerVillage || null,
        status || "TEGEREJE UMUHUZA",
      ]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "KOMANDE YABITSWE. UMUSARURO WAKUWE KU ISOKO.",
      order: result.rows[0],
    });

  } catch (error) {
    if (client && transactionStarted) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("POST ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "KUBIKA KOMANDE BYANZE.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });

  } finally {
    if (client) client.release();
  }
});
// UPDATE ORDER STATUS
app.patch("/api/orders/:id/status", authenticateOrderUser, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  let client;
  let transactionStarted = false;

  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order ID si yo."
      });
    }

    // BUYER CONFIRMS RECEIPT
    if (status === "YAKIRIWE N'UMUGUZI") {
      authenticateOrderUser(req, res, () => {});
      if (res.headersSent) return;

      if (req.user.role !== "UMUGUZI") {
        return res.status(403).json({
          success: false,
          message: "IKI GIKORWA CYEMEREWE UMUGUZI GUSA."
        });
      }

      await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_received_at TIMESTAMPTZ");
      const buyerOrder = await pool.query(
        `SELECT buyer_phone, status FROM orders WHERE id = $1`,
        [id]
      );

      if (buyerOrder.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "KOMANDE NTIBONETSE."
        });
      }

      const normalizePhone = (phone) =>
        String(phone || "").replace(/\D/g, "").replace(/^250/, "0");

      if (
        normalizePhone(req.user.phone) !==
        normalizePhone(buyerOrder.rows[0].buyer_phone)
      ) {
        return res.status(403).json({
          success: false,
          message: "NTURI WOWATANZE IRI KOMANDE."
        });
      }

      if (!["YOHEREJWE", "YAHAGEZE"].includes(buyerOrder.rows[0].status)) {
        return res.status(409).json({
          success: false,
          message: "UMUSARURO UGOMBA KUBA WOHEREJWE MBERE YO KWAKIRWA."
        });
      }

      const received = await pool.query(
        `UPDATE orders
         SET status = $1, buyer_received_at = NOW(), updated_at = NOW()
         WHERE id = $2 AND status IN ('YOHEREJWE', 'YAHAGEZE')
         RETURNING *`,
        ["YAKIRIWE N'UMUGUZI", id]
      );

      if (received.rows.length === 0) {
        return res.status(409).json({
          success: false,
          message: "STATUS YAHINDUTSE. ONGERA UREBE KOMANDE."
        });
      }

      return res.json({
        success: true,
        message: "UMUSARURO WAKIRIWE NEZA.",
        order: received.rows[0]
      });
    }

    const allowedStatuses = [
      "YEMEJWE N'UMUHUZA",
      "YANZWE N'UMUHUZA",
      "TEGEREJE DELIVERY",
      "YOHEREJWE",
      "YAHAGEZE"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "STATUS NTEMEWE."
      });
    }

    if (!["UMUHUZA", "ADMIN"].includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "IKI GIKORWA CYEMEREWE UMUHUZA GUSA."
      });
    }

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    const orderResult = await client.query(
      `SELECT * FROM orders WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "KOMANDE NTIBONETSE."
      });
    }

    const order = orderResult.rows[0];

    // DELIVERY: kubika status gusa, nta kugabanya umusaruro.
    const deliveryTransitions = {
      "TEGEREJE DELIVERY": "YEMEJWE N'UMUHUZA",
      "YOHEREJWE": "TEGEREJE DELIVERY",
      "YAHAGEZE": "YOHEREJWE"
    };

    if (Object.prototype.hasOwnProperty.call(deliveryTransitions, status)) {
      const requiredPreviousStatus = deliveryTransitions[status];

      if (order.status !== requiredPreviousStatus) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          success: false,
          message: "STATUS YA DELIVERY NTIKURIKIRANYE N'IGIHE KIGEZEHO.",
          currentStatus: order.status,
          requiredStatus: requiredPreviousStatus
        });
      }

      const deliveryUpdate = await client.query(
        `UPDATE orders
         SET status = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return res.json({
        success: true,
        message: "STATUS YA DELIVERY YABITSWE MURI POSTGRESQL.",
        order: deliveryUpdate.rows[0]
      });
    }

    if (order.status === "YEMEJWE N'UMUHUZA") {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "IYI KOMANDE YARAMAZE KWEMEZWA. NTA MUSARURO WONDEYE KABIRI."
      });
    }

    if (order.status !== "TEGEREJE UMUHUZA") {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "IYI KOMANDE NTIKIRI MU RUTONDE RW'IZITEGEREJE."
      });
    }

    // Iyo komande yanze, subiza umusaruro ku isoko.
    if (status === "YANZWE N'UMUHUZA") {
      const rejected = await client.query(
        `UPDATE orders
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      await client.query(
        `UPDATE products
         SET is_sold = FALSE,
             sold_at = NULL,
             status = 'WEMEJWE',
             updated_at = NOW()
         WHERE id = $1`,
        [order.product_id]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      return res.json({
        success: true,
        message: "KOMANDE YANZWE. UMUSARURO WASUBIYE KU ISOKO.",
        order: rejected.rows[0]
      });
    }

    // Gufunga umusaruro kugira ngo utagabanywa n'andi makomende icyarimwe.
    const productId = Number(order.product_id);
    const requestedQuantity = Number(order.requested_quantity);

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !Number.isFinite(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "IBIMENYETSO BY'UMUSARURO CYANGWA INGANO WASABWE SI BYO."
      });
    }

    const productResult = await client.query(
      `SELECT * FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message: "UMUSARURO NTUBONETSE."
      });
    }

    const product = productResult.rows[0];
    const currentQuantity = Number(product.quantity);

    if (product.status !== "WEMEJWE") {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "UMUSARURO NTUKIRI MU MITUNGO YEMEJWE."
      });
    }

    if (
      !Number.isFinite(currentQuantity) ||
      currentQuantity < requestedQuantity
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        success: false,
        message: "UMUSARURO USIGAYE NTUHAGIJE INGANO UMUGUZI ASABA.",
        availableQuantity: currentQuantity
      });
    }

    const remainingQuantity = currentQuantity - requestedQuantity;
    const newProductStatus =
      remainingQuantity <= 0 ? "YARAGUZWE" : "WEMEJWE";

    await client.query(
      `UPDATE products
       SET quantity = $1,
           status = $2,
           is_sold = $3,
           sold_at = CASE WHEN $3 = TRUE THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $4`,
      [
        remainingQuantity,
        newProductStatus,
        remainingQuantity <= 0,
        productId
      ]
    );

    const approved = await client.query(
      `UPDATE orders
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return res.json({
      success: true,
      message: "KOMANDE YEMEJWE. UMUSARURO USIGAYE WAVUGURUWE.",
      order: approved.rows[0],
      product: {
        id: productId,
        quantity: remainingQuantity,
        status: newProductStatus
      }
    });

  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("ROLLBACK ERROR:", rollbackError);
      }
    }

    console.error("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "GUHINDURA STATUS BYANZE.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });

  } finally {
    if (client) {
      client.release();
    }
  }
});


// INTERMEDIARY PROFILE DATABASE
const intermediaryProfileSchemaReady = (async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS intermediary_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      full_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      work_place TEXT NOT NULL DEFAULT '',
      district TEXT NOT NULL DEFAULT '',
      sector TEXT NOT NULL DEFAULT '',
      cell TEXT NOT NULL DEFAULT '',
      village TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE intermediary_profile
    ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT ''
  `);

  await pool.query(`
    INSERT INTO intermediary_profile (id)
    VALUES (1)
    ON CONFLICT (id) DO NOTHING
  `);
})();

// GET INTERMEDIARY PROFILE
app.get("/api/intermediary-profile", async (req, res) => {
  try {
    await intermediaryProfileSchemaReady;

    const result = await pool.query(
      "SELECT * FROM intermediary_profile WHERE id = 1"
    );

    return res.json({
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error("GET INTERMEDIARY PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "KUBONA UMWIRONDORO BYANZE."
    });
  }
});

// SAVE INTERMEDIARY PROFILE
app.put("/api/intermediary-profile", async (req, res) => {
  try {
    await intermediaryProfileSchemaReady;

    const fields = [
      "full_name", "phone", "work_place",
      "province", "district", "sector", "cell", "village"
    ];

    const profile = {};

    for (const field of fields) {
      profile[field] = String(req.body[field] ?? "").trim();

      if (!profile[field]) {
        return res.status(400).json({
          success: false,
          message: "Uzuza amakuru yose y'umwirondoro mbere yo kubika."
        });
      }
    }

    const result = await pool.query(`
      INSERT INTO intermediary_profile (
        id, full_name, phone, work_place,
        province, district, sector, cell, village, updated_at
      )
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        work_place = EXCLUDED.work_place,
        province = EXCLUDED.province,
        district = EXCLUDED.district,
        sector = EXCLUDED.sector,
        cell = EXCLUDED.cell,
        village = EXCLUDED.village,
        updated_at = NOW()
      RETURNING *
    `, [
      profile.full_name,
      profile.phone,
      profile.work_place,
      profile.province,
      profile.district,
      profile.sector,
      profile.cell,
      profile.village
    ]);

    return res.json({
      success: true,
      message: "UMWIRONDORO WABITSWE NEZA.",
      profile: result.rows[0]
    });
  } catch (error) {
    console.error("SAVE INTERMEDIARY PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "KUBIKA UMWIRONDORO BYANZE."
    });
  }
});

// SERVER
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`GURISHA BACKEND iri kuri http://localhost:${PORT}`);
});

// HANDLE DATABASE CONNECTION ERRORS
pool.on("error", (error) => {
  console.error("UNEXPECTED DATABASE ERROR:", error);
});

process.on("SIGTERM", () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});























