import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

// ✅ POST - create a new order
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
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
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

    // Optional: send confirmation email
    const itemList = cart.map((item) => {
      const total = item.sizes.reduce((sum, s) => sum + s.quantity * item.price, 0);
      const sizeInfo = item.sizes.map((s) => `${s.size} (${s.quantity})`).join(", ");
      return `<li><strong>${item.name}</strong>: ${sizeInfo} – ${total} ден</li>`;
    }).join("");

    const totalPrice = cart.reduce(
      (sum, item) =>
        sum + item.sizes.reduce((s, sz) => s + sz.quantity * item.price, 0),
      0
    );

    const html = `
      <h2>Потврда за нарачка</h2>
      <p>Почитуван(а) ${name},</p>
      <p>Ви благодариме за вашата нарачка:</p>
      <ul>${itemList}</ul>
      <p><strong>Вкупна сума:</strong> ${totalPrice} ден</p>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Вашата нарачка е примена ✔",
      html,
    });

    return new Response(JSON.stringify({ message: "Order placed!" }), { status: 201 });
  } catch (err) {
    console.error("Order error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
