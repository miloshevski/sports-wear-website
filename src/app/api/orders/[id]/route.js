import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderHistory from "@/models/OrderHistory";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { action } = await req.json(); // "accept" or "decline"

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 🧮 Calculate total
    const total = order.cart.reduce(
      (sum, item) =>
        sum + item.sizes.reduce((s, sz) => s + sz.quantity * item.price, 0),
      0
    );

    // 📝 Simplify product list for history DB
    const simplifiedProducts = order.cart.flatMap((item) =>
      item.sizes.map((sz) => ({
        name: item.name,
        size: sz.size,
        quantity: sz.quantity,
      }))
    );

    // 💌 Email setup
    const itemList = order.cart
      .map((item) => {
        const sizeInfo = item.sizes
          .map((s) => `${s.size} (${s.quantity})`)
          .join(", ");
        return `<li><strong>${item.name}</strong>: ${sizeInfo}</li>`;
      })
      .join("");

    let subject = "";
    let html = "";

    if (action === "accept") {
      subject = "Вашата нарачка е потврдена ✅";
      html = `
        <p>Почитуван(а) ${order.name},</p>
        <p>Вашата нарачка е прифатена и ќе биде испорачана наскоро.</p>
        <p><strong>Производи:</strong></p>
        <ul>${itemList}</ul>
        <p><strong>Вкупна сума:</strong> ${total} ден</p>
        <p>Ви благодариме!</p>
      `;
    } else if (action === "decline") {
      subject = "Вашата нарачка не може да биде исполнета ❌";
      html = `
        <p>Почитуван(а) ${order.name},</p>
        <p>За жал, не можеме да ја испорачаме вашата нарачка во моментов.</p>
        <p>Ве молиме обидете се повторно подоцна.</p>
      `;
    }

    // 📬 Send email
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: order.email,
      subject,
      html,
    });

    // 🗃 Move to OrderHistory
    await OrderHistory.create({
      name: order.name,
      email: order.email,
      address: order.address,
      phone: order.phone,
      products: simplifiedProducts,
      total,
      status: action === "accept" ? "accepted" : "declined",
    });

    // 🧹 Delete from active orders
    await order.deleteOne();

    return NextResponse.json({ message: "Moved to history." });
  } catch (err) {
    console.error("Error processing order:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
