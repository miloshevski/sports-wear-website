import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  await connectDB();

  const session = await getServerSession({ req, ...authOptions });

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { productId, direction } = await req.json();

  const current = await Product.findById(productId);
  if (!current)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  const all = await Product.find().sort({ order: -1 });

  const index = all.findIndex((p) => p._id.equals(current._id));
  const swapIndex = direction === "forward" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= all.length) {
    return NextResponse.json(
      { message: "Cannot move further" },
      { status: 400 }
    );
  }

  const swapWith = all[swapIndex];

  // Swap order values
  const temp = current.order;
  current.order = swapWith.order;
  swapWith.order = temp;

  await current.save();
  await swapWith.save();

  return NextResponse.json({ message: "Reordered successfully" });
}
