// reindex-orders.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./src/models/product.cjs");

dotenv.config(); // this loads .env by default

async function reindexOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const products = await Product.find().sort({ createdAt: 1 });

    for (let i = 0; i < products.length; i++) {
      products[i].order = i + 1;
      await products[i].save();
    }

    console.log(`✅ Reindexed ${products.length} products`);
  } catch (err) {
    console.error("❌ Failed to reindex orders:", err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

reindexOrders();
