import mongoose from "mongoose";

const OrderHistorySchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    address: String,
    phone: String,
    products: [
      {
        name: String,
        size: String,
        quantity: Number,
      },
    ],
    total: Number,
    status: {
      type: String,
      enum: ["accepted", "declined"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.OrderHistory ||
  mongoose.model("OrderHistory", OrderHistorySchema);
