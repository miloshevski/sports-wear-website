import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `Спортска Опрема <${process.env.EMAIL_FROM}>`;
const ADMIN_EMAIL = "collabswithana@gmail.com";

// GET - fetch all orders
export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(orders));
  } catch (err) {
    return new Response("Failed to fetch orders", { status: 500 });
  }
}

// POST - create a new order
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
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Enrich cart with product images
    const enrichedCart = await Promise.all(
      cart.map(async (item) => {
        if (!item.images || item.images.length === 0) {
          const product = await Product.findById(item.productId);
          return { ...item, images: product?.images || [] };
        }
        return item;
      })
    );

    const order = new Order({
      name,
      email,
      address,
      phone,
      cart: enrichedCart,
      status: "pending",
      createdAt: new Date(),
    });

    await order.save();

    // Build shared HTML helpers
    const itemRows = enrichedCart
      .map((item) => {
        const itemTotal = item.sizes.reduce(
          (sum, s) => sum + s.quantity * item.price,
          0
        );
        const sizeInfo = item.sizes
          .map((s) => `${s.size} (${s.quantity})`)
          .join(", ");
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${sizeInfo}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${itemTotal} ден</td>
        </tr>`;
      })
      .join("");

    const totalPrice = enrichedCart.reduce(
      (sum, item) =>
        sum + item.sizes.reduce((s, sz) => s + sz.quantity * item.price, 0),
      0
    );

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
            <td style="padding:10px 12px;font-weight:bold;text-align:right;">${totalPrice} ден</td>
          </tr>
        </tfoot>
      </table>`;

    // Email to customer
    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
        <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:30px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Потврда за нарачка</h1>
        </div>
        <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p>Почитуван(а) <strong>${name}</strong>,</p>
          <p>Ви благодариме за вашата нарачка! Ја примивме и ќе ја обработиме наскоро.</p>
          ${tableHtml}
          <p style="margin-top:20px;color:#555;">Ќе ве известиме кога нарачката ќе биде потврдена.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="font-size:13px;color:#999;">Спортска Опрема · sportskaoprema.mk</p>
        </div>
      </div>`;

    // Email to admin
    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
        <div style="background:#111827;padding:24px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;">🛒 Нова нарачка!</h1>
        </div>
        <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p><strong>Име:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Телефон:</strong> ${phone}</p>
          <p><strong>Адреса:</strong> ${address}</p>
          ${tableHtml}
        </div>
      </div>`;

    // Send emails — non-blocking: failures are logged but don't break order creation
    try {
      const [customerResult, adminResult] = await Promise.allSettled([
        resend.emails.send({
          from: FROM,
          to: email,
          subject: "Вашата нарачка е примена ✔",
          html: customerHtml,
        }),
        resend.emails.send({
          from: FROM,
          to: ADMIN_EMAIL,
          subject: "🛒 Нова нарачка во продавницата",
          html: adminHtml,
        }),
      ]);

      if (customerResult.status === "rejected") {
        console.error("❌ Customer email failed:", customerResult.reason);
      } else {
        console.log("✅ Customer email sent:", customerResult.value);
      }

      if (adminResult.status === "rejected") {
        console.error("❌ Admin email failed:", adminResult.reason);
      } else {
        console.log("✅ Admin email sent:", adminResult.value);
      }
    } catch (emailErr) {
      console.error("❌ Email sending error:", emailErr);
    }

    return new Response(JSON.stringify({ message: "Order placed!" }), {
      status: 201,
    });
  } catch (err) {
    console.error("Order error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
