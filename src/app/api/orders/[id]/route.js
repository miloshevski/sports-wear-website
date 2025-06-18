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

    // 📝 Prepare simplified product list for history
    const simplifiedProducts = order.cart.flatMap((item) =>
      item.sizes.map((sz) => ({
        name: item.name,
        size: sz.size,
        quantity: sz.quantity,
      }))
    );

    // 🖼 Prepare item list for email
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
      let outOfStock = false;

      // ✅ 1. Validate all stock
      for (const item of order.cart) {
        const product = await import("@/models/Product").then((mod) =>
          mod.default.findById(item.productId)
        );

        if (!product) {
          outOfStock = true;
          break;
        }

        for (const sizeOrder of item.sizes) {
          const size = product.sizes.find((s) => s.size === sizeOrder.size);
          if (!size || size.quantity < sizeOrder.quantity) {
            outOfStock = true;
            break;
          }
        }

        if (outOfStock) break;
      }

      // ❌ Reject if out of stock
      if (outOfStock) {
        return NextResponse.json(
          { error: "Cannot accept — one or more items are out of stock." },
          { status: 400 }
        );
      }

      // ✅ 2. Update product stock
      for (const item of order.cart) {
        const product = await import("@/models/Product").then((mod) =>
          mod.default.findById(item.productId)
        );

        for (const sizeOrder of item.sizes) {
          const sizeIndex = product.sizes.findIndex(
            (s) => s.size === sizeOrder.size
          );

          if (sizeIndex !== -1) {
            product.sizes[sizeIndex].quantity -= sizeOrder.quantity;

            if (product.sizes[sizeIndex].quantity < 0) {
              product.sizes[sizeIndex].quantity = 0;
            }
          }
        }

        await product.save();
      }

      // ✅ 3. Set email content for accept
      subject = "Вашата нарачка е прифатена ✅";
      html = `
        <p>Почитуван(а) ${order.name},</p>
        <p>Вашата нарачка е прифатена и ќе биде испратена наскоро.</p>
        <ul>${itemList}</ul>
        <p><strong>Вкупна сума:</strong> ${total} ден</p>
        <p>Ви благодариме за довербата!</p>
      `;
    } else if (action === "decline") {
      // ❌ Email content for decline
      subject = "Вашата нарачка не може да биде исполнета ❌";
      html = `
        <p>Почитуван(а) ${order.name},</p>
        <p>За жал, не можеме да ја испорачаме вашата нарачка во моментов.</p>
        <p>Ве молиме обидете се повторно подоцна.</p>
      `;
    }

    // 📬 Send email to customer
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: order.email,
        subject,
        html,
      });
    } catch (emailErr) {
      console.error("❌ Failed to send email:", emailErr);
    }

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
    console.error("❌ Error processing order:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
