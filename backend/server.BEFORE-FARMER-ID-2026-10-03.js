const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
});

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
      message: "KUBONA UMUSARURO BYANZE",
    });
  }
});

// POST PRODUCT
app.post("/api/products", async (req, res) => {
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

    if (
      !name ||
      !type ||
      quantity === undefined ||
      !unit ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Amakuru y'ingenzi y'umusaruro arabura.",
      });
    }

    const result = await pool.query(
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
        rejection_reason
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING *
      `,
      [
        name,
        type,
        farmerName || null,
        farmerPhone || null,
        quantity,
        unit,
        price,
        province || null,
        district || null,
        sector || null,
        cell || null,
        village || null,
        status || "NTABWO WAGENZUWE",
        rejectionReason || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "UMUSARURO WABITSWE MURI DATABASE.",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("POST PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "KUBIKA UMUSARURO BYANZE.",
    });
  }
});

// GET ORDERS
app.get("/api/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM orders
      ORDER BY id DESC
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

// GET BUYER ORDERS BY PHONE
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

    const result = await pool.query(
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

        farmerName || null,
        farmerPhone || null,

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

    res.status(201).json({
      success: true,
      message: "KOMANDE YABITSWE MURI DATABASE.",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("POST ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "KUBIKA KOMANDE BYANZE.",
    });
  }
});

// UPDATE ORDER STATUS
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status irakenewe.",
      });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "KOMANDE NTIBONETSE.",
      });
    }

    res.json({
      success: true,
      message: "STATUS YA KOMANDE YAHINDUTSE.",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "GUHINDURA STATUS BYANZE.",
    });
  }
});

// SERVER
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`GURISHA BACKEND iri kuri http://localhost:${PORT}`);
});