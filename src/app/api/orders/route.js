import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, email, address, phone, cart } = body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !address?.trim() ||
      !phone?.trim() ||
      !Array.isArray(cart) ||
      cart.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    // 💬 Compose confirmation email
    const itemList = cart
      .map((item) => {
        const totalItemPrice = item.sizes.reduce(
          (sum, s) => sum + s.quantity * item.price,
          0
        );
        const sizeInfo = item.sizes
          .map((s) => `${s.size} (${s.quantity})`)
          .join(", ");

        return `<li><strong>${item.name}</strong>: ${sizeInfo} – ${totalItemPrice} ден</li>`;
      })
      .join("");

    const total = cart.reduce(
      (sum, item) =>
        sum + item.sizes.reduce((s, sz) => s + sz.quantity * item.price, 0),
      0
    );

    const emailHTML = `
      <h2>Потврда за нарачка</h2>
      <p>Почитуван(а) ${name},</p>
      <p>Ви благодариме за вашата нарачка. Еве ги деталите:</p>
      <ul>${itemList}</ul>
      <p><strong>Вкупна сума:</strong> ${total} ден</p>
      <p>Ќе ве контактираме наскоро за испорака.</p>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM, // Example: 'onboarding@resend.dev'
      to: email,
      subject: "Вашата нарачка е примена ✔",
      html: emailHTML,
    });

    return NextResponse.json({ message: "Order placed successfully!" });
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}
