"use client";

import { useCart } from "@/lib/useCart";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeItem } = useCart();

  const isEmpty = cart.length === 0;

  const totalItems = cart.reduce(
    (sum, item) => sum + item.sizes.reduce((acc, s) => acc + s.quantity, 0),
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + item.sizes.reduce((acc, s) => acc + s.quantity * item.price, 0),
    0
  );

  const getImageUrl = (publicId) => {
    if (publicId && typeof publicId === "string") {
      const url = `https://res.cloudinary.com/dh6mjupoi/image/upload/w_120,h_120,c_fill,f_auto,q_40/${publicId}`;
      return url;
    }
    return null;
  };

  return (
    <div className="p-5">
      <div className="max-w-3xl mx-auto mt-10 p-5 bg-white border rounded">
        <h1 className="text-2xl font-bold mb-4">🛒 Кошничка</h1>

        {isEmpty ? (
          <p>Кошничката е празна.</p>
        ) : (
          <>
            {cart.map((item, index) => (
              <div
                key={index}
                className="border-b py-4 flex flex-col sm:flex-row gap-4 sm:items-center"
              >
                {/* 🖼️ Product Image with debug */}
                {item.images?.[0] &&
                  (() => {
                    const imageUrl = getImageUrl(item.images[0]);

                    return (
                      <div className="relative w-24 h-24 shrink-0 bg-zinc-100 rounded overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    );
                  })()}

                {/* Product Info */}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{item.name}</h2>
                  <ul className="text-sm mt-2">
                    {item.sizes.map((s, i) => (
                      <li key={i}>
                        {item.name} – <strong>{s.size}</strong> ({s.quantity}) ={" "}
                        <strong>{s.quantity * item.price} ден</strong>
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
              </div>
            ))}

            <div className="mt-6 text-right text-sm">
              <p className="font-semibold">Вкупно производи: {totalItems}</p>
              <p className="font-bold text-lg">Вкупна сума: {totalPrice} ден</p>
            </div>

            <Link
              href="/order"
              className="mt-6 inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Продолжи кон нарачка →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
