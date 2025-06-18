import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: String,
      price: Number,
      images: [String], // ✅ Add this line
      sizes: [
        {
          size: String,
          quantity: Number,
        },
      ],
    },
  ],
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
