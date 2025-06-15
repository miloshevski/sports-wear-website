import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { action } = await req.json(); // "accept" or "decline"

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const total = order.cart.reduce(
      (sum, item) =>
        sum +
        item.sizes.reduce((s, sz) => s + sz.quantity * item.price, 0),
      0
    );

    const itemList = order.cart
      .map((item) => {
        const sizeInfo = item.sizes.map((s) => `${s.size} (${s.quantity})`).join(", ");
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

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: order.email,
      subject,
      html,
    });

    await Order.findByIdAndDelete(id);
    return NextResponse.json({ message: "Processed and deleted." });
  } catch (err) {
    console.error("Error processing order:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
