const mongoose = require("mongoose");
require("dotenv").config();

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

const seedProducts = [
  { name: "Milk", price: 2.5 },
  { name: "Bread", price: 1.75 },
  { name: "Cheese", price: 4.2 },
  { name: "Coffee", price: 6.1 },
  { name: "Fruit", price: 3.0 },
];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in .env");
  }

  await mongoose.connect(process.env.MONGODB_URI, { autoIndex: true });

  const created = await Product.insertMany(seedProducts);
  console.log("Seeded products:");
  created.forEach((product) => {
    console.log(`- ${product.name}: $${product.price.toFixed(2)}`);
  });

  await mongoose.connection.close();
};

run().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
