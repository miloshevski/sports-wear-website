import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // DEBUG LOG
    console.log("Received order body:", JSON.stringify(body, null, 2));

    const { name, email, address, phone, cart } = body;

    if (!name || !email || !address || !phone) {
      return NextResponse.json(
        { error: "Missing customer fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "Cart must be a non-empty array" },
        { status: 400 }
      );
    }

    // Optional: Validate productId, sizes, etc.
    for (const item of cart) {
      if (!item.productId || !item.name || !Array.isArray(item.sizes)) {
        return NextResponse.json(
          { error: "Invalid cart item structure" },
          { status: 400 }
        );
      }
    }

    const order = new Order({
      name,
      email,
      address,
      phone,
      cart,
      status: "pending",
      createdAt: new Date(),
    });

    await order.save();

    return NextResponse.json({ message: "Order placed successfully!" });
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    return NextResponse.json(
      { error: "Failed to place order", details: err.message },
      { status: 500 }
    );
  }
}
