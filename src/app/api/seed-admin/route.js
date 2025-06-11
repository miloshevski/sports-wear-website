import { connectDB } from "../../../lib/db.js";
import User from "../../../models/User.js";
import bcrypt from "bcrypt";

export async function GET() {
  await connectDB();

  const existing = await User.findOne({ email: "admin@shop.com" });
  if (existing) {
    return new Response(JSON.stringify({ message: "Admin already exists" }), {
      status: 200,
    });
  }

  const hashedPassword = await bcrypt.hash("bikeadmin123", 10);

  const admin = new User({
    email: "admin@shop.com",
    passwordHash: hashedPassword,
    isAdmin: true,
  });

  await admin.save();

  return new Response(
    JSON.stringify({ message: "✅ Admin user created successfully!" }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }
  );
}
