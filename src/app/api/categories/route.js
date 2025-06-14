import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  await connectDB();
  const categories = await Category.find({});
  return NextResponse.json(categories);
}

export async function POST(req) {
  await connectDB();
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  const existing = await Category.findOne({ name });
  if (existing) return NextResponse.json(existing);

  const created = await Category.create({ name });
  return NextResponse.json(created, { status: 201 });
}
