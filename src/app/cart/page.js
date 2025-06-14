"use client";

import { useCart } from "@/lib/useCart";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeItem } = useCart();

  const isEmpty = cart.length === 0;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white border rounded">
      <h1 className="text-2xl font-bold mb-4">🛒 Кошничка</h1>

      {isEmpty ? (
        <p>Кошничката е празна.</p>
      ) : (
        <>
          {cart.map((item, index) => (
            <div key={index} className="border-b py-4">
              <h2 className="font-semibold text-lg">{item.name}</h2>
              <ul className="text-sm mt-2">
                {item.sizes.map((s, i) => (
                  <li key={i}>
                    Големина: <strong>{s.size}</strong>, Количина:{" "}
                    <strong>{s.quantity}</strong>
                  </li>
                ))}
              </ul>
              <button
                className="mt-2 text-red-600 text-sm hover:underline"
                onClick={() => removeItem(index)}
              >
                🗑 Поништи
              </button>
            </div>
          ))}

          <Link
            href="/order"
            className="mt-6 inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Продолжи кон нарачка →
          </Link>
        </>
      )}
    </div>
  );
}
