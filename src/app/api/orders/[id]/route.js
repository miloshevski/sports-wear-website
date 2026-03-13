import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderHistory from "@/models/OrderHistory";
import Product from "@/models/Product";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `Спортска Опрема <${process.env.EMAIL_FROM}>`;

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { action } = await req.json(); // "accept" or "decline"

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Calculate total
    const total = order.cart.reduce(
      (sum, item) =>
        sum + item.sizes.reduce((s, sz) => s + sz.quantity * item.price, 0),
      0
    );

    // Simplified product list for history
    const simplifiedProducts = order.cart.flatMap((item) =>
      item.sizes.map((sz) => ({
        name: item.name,
        size: sz.size,
        quantity: sz.quantity,
      }))
    );

    // Build item table for email
    const itemRows = order.cart
      .map((item) => {
        const sizeInfo = item.sizes
          .map((s) => `${s.size} (${s.quantity})`)
          .join(", ");
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${sizeInfo}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${item.price} ден</td>
        </tr>`;
      })
      .join("");

    const tableHtml = `
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f4f4f4;">
            <th style="padding:8px 12px;text-align:left;">Производ</th>
            <th style="padding:8px 12px;text-align:left;">Големина</th>
            <th style="padding:8px 12px;text-align:right;">Цена</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:10px 12px;font-weight:bold;">Вкупно</td>
            <td style="padding:10px 12px;font-weight:bold;text-align:right;">${total} ден</td>
          </tr>
        </tfoot>
      </table>`;

    let subject = "";
    let html = "";

    if (action === "accept") {
      let outOfStock = false;

      // Validate all stock
      for (const item of order.cart) {
        const product = await Product.findById(item.productId);
        if (!product) { outOfStock = true; break; }

        for (const sizeOrder of item.sizes) {
          const size = product.sizes.find((s) => s.size === sizeOrder.size);
          if (!size || size.quantity < sizeOrder.quantity) {
            outOfStock = true;
            break;
          }
        }
        if (outOfStock) break;
      }

      if (outOfStock) {
        return NextResponse.json(
          { error: "Cannot accept — one or more items are out of stock." },
          { status: 400 }
        );
      }

      // Update product stock
      for (const item of order.cart) {
        const product = await Product.findById(item.productId);
        for (const sizeOrder of item.sizes) {
          const sizeIndex = product.sizes.findIndex(
            (s) => s.size === sizeOrder.size
          );
          if (sizeIndex !== -1) {
            product.sizes[sizeIndex].quantity = Math.max(
              0,
              product.sizes[sizeIndex].quantity - sizeOrder.quantity
            );
          }
        }
        await product.save();
      }

      subject = "Вашата нарачка е прифатена ✅";
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:linear-gradient(135deg,#059669,#047857);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:22px;">✅ Нарачката е прифатена!</h1>
          </div>
          <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <p>Почитуван(а) <strong>${order.name}</strong>,</p>
            <p>Вашата нарачка е прифатена и ќе биде испратена наскоро.</p>
            ${tableHtml}
            <p style="margin-top:20px;">Ви благодариме за довербата!</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:13px;color:#999;">Спортска Опрема · sportskaoprema.mk</p>
          </div>
        </div>`;
    } else if (action === "decline") {
      subject = "Вашата нарачка не може да биде исполнета ❌";
      html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
          <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:30px;border-radius:12px 12px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:22px;">❌ Нарачката е одбиена</h1>
          </div>
          <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
            <p>Почитуван(а) <strong>${order.name}</strong>,</p>
            <p>За жал, не можеме да ја испорачаме вашата нарачка во моментов.</p>
            <p>Ве молиме обидете се повторно подоцна или контактирајте нè за повеќе информации.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:13px;color:#999;">Спортска Опрема · sportskaoprema.mk</p>
          </div>
        </div>`;
    }

    // Send email to customer
    try {
      const result = await resend.emails.send({
        from: FROM,
        to: order.email,
        subject,
        html,
      });
      console.log(`✅ Status email sent (${action}):`, result);
    } catch (emailErr) {
      console.error(`❌ Failed to send status email (${action}):`, emailErr);
    }

    // Move to OrderHistory
    await OrderHistory.create({
      name: order.name,
      email: order.email,
      address: order.address,
      phone: order.phone,
      products: simplifiedProducts,
      total,
      status: action === "accept" ? "accepted" : "declined",
    });

    // Delete from active orders
    await order.deleteOne();

    return NextResponse.json({ message: "Moved to history." });
  } catch (err) {
    console.error("❌ Error processing order:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
