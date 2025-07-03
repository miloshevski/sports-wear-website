"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded-lg shadow border">
      <h2 className="text-2xl font-semibold text-center mb-6 text-zinc-800">
        Admin Login
      </h2>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Корисничко име"
            required
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-zinc-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-zinc-800"
          />
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-all duration-150"
        >
          Login
        </button>
      </form>
    </div>
  );
}
