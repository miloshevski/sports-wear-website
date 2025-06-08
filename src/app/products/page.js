// /app/products/page.js
"use client";

import Link from "next/link";
import React from "react"; // ✅ This import is required in some setups

const categories = [
  { name: "Jerseys", slug: "jerseys" },
  { name: "Shorts", slug: "shorts" },
  { name: "Gloves", slug: "gloves" },
  { name: "Jackets", slug: "jackets" },
];

export default function ShopPage() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold mb-8">Shop by Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products/${cat.slug}`}
            className="border rounded-xl p-6 hover:shadow-lg transition"
          >
            <h2 className="text-2xl font-semibold">{cat.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
