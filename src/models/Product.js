import mongoose from "mongoose";

const SizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    sizes: [SizeSchema],
    images: [{ type: String }], // Cloudinary public_ids
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
