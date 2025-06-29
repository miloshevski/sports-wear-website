import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET a single product by ID
export async function GET(_request, contextPromise) {
  const { params } = await contextPromise;
  const { id } = params;

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const product = await Product.findById(id);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// DELETE a product by ID
export async function DELETE(_request, contextPromise) {
  const { params } = await contextPromise;
  const { id } = params;

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Optional: Delete associated Cloudinary images
  if (deletedProduct.images?.length > 0) {
    for (const publicId of deletedProduct.images) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error(`Failed to delete Cloudinary image: ${publicId}`, err);
      }
    }
  }

  return NextResponse.json({ message: "✅ Product deleted successfully" });
}

// UPDATE a product by ID
// UPDATE a product by ID
export async function PUT(request, contextPromise) {
  const { params } = await contextPromise;
  const { id } = params;

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const body = await request.json();

  console.log("📥 PUT /api/products/[id] BODY:");
  console.log(JSON.stringify(body, null, 2));

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    console.log("✅ UPDATED product:");
    console.log(JSON.stringify(updatedProduct, null, 2));

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("❌ Failed to update product", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
