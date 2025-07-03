import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // 🧠 Find the current max order
    const lastProduct = await Product.findOne().sort({ order: -1 });
    const nextOrder = lastProduct ? lastProduct.order + 1 : 1;

    // 🆕 Create product with correct order
    const product = await Product.create({
      ...body,
      order: nextOrder,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("❌ Failed to create product", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
