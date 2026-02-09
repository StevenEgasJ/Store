const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const ivaRate = Number.parseFloat(process.env.IVA_RATE || "0.15");

if (Number.isNaN(ivaRate) || ivaRate < 0) {
  throw new Error("IVA_RATE must be a non-negative number.");
}

mongoose
  .connect(process.env.MONGODB_URI, {
    autoIndex: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/iva", async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length !== 5) {
      return res.status(400).json({
        error: "Provide exactly 5 products.",
      });
    }

    const cleaned = products.map((product) => ({
      name: String(product.name || "").trim(),
      price: Number.parseFloat(product.price),
    }));

    const invalid = cleaned.find(
      (product) => !product.name || Number.isNaN(product.price) || product.price < 0
    );

    if (invalid) {
      return res.status(400).json({
        error: "Each product needs a name and a non-negative price.",
      });
    }

    const created = await Product.insertMany(cleaned);
    const total = created.reduce((sum, product) => sum + product.price, 0);
    const iva = Number((total * ivaRate).toFixed(2));

    return res.json({
      total: Number(total.toFixed(2)),
      iva,
      rate: ivaRate,
      productIds: created.map((product) => product._id),
    });
  } catch (error) {
    console.error("IVA calculation error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
