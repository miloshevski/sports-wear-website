import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const { orderedIds } = await req.json();

  try {
    const updates = orderedIds.map((id, index) =>
      Product.findByIdAndUpdate(id, { order: index + 1 })
    );

    await Promise.all(updates); // ✅ update сите паралелно

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Error reordering:", err);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
