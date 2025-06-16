import { connectDB } from "@/lib/db";
import OrderHistory from "@/models/OrderHistory";

export async function GET() {
  try {
    await connectDB();
    const history = await OrderHistory.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(history), { status: 200 });
  } catch (err) {
    return new Response("Failed to fetch order history", { status: 500 });
  }
}
