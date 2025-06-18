"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  const getImageUrl = (publicId) => {
    if (publicId && typeof publicId === "string") {
      return `https://res.cloudinary.com/dh6mjupoi/image/upload/w_80,h_80,c_fill,f_auto,q_40/${publicId}`;
    }
    return null;
  };

  const handleAction = async (id, action) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      setOrders((prev) => prev.filter((order) => order._id !== id));
    } else {
      alert("Продуктот го нема на залиха! Автоматски ќе биде одбиен.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Сите нарачки</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">Нема нарачки.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            console.log("📦 Order cart contents:", order.cart);
            const total = order.cart.reduce(
              (sum, item) =>
                sum +
                item.sizes.reduce(
                  (sizeSum, s) => sizeSum + s.quantity * item.price,
                  0
                ),
              0
            );

            return (
              <div
                key={order._id}
                className="border p-4 rounded-lg shadow bg-white"
              >
                <p>
                  <strong>Име:</strong> {order.name}
                </p>
                <p>
                  <strong>Email:</strong> {order.email}
                </p>
                <p>
                  <strong>Телефон:</strong> {order.phone}
                </p>
                <p>
                  <strong>Адреса:</strong> {order.address}
                </p>
                <p>
                  <strong>Статус:</strong> {order.status}
                </p>
                <p className="font-semibold mt-2">Производи:</p>
                <ul className="space-y-4 mt-2 ml-2">
                  {order.cart.map((item, i) => {
                    const firstImage = item.images?.[0];
                    const imageUrl = getImageUrl(firstImage);
                    console.log("🖼️ Preview image:", firstImage, "→", imageUrl);

                    return (
                      <li key={i} className="flex gap-4 items-start">
                        {imageUrl && (
                          <div className="relative w-20 h-20 rounded overflow-hidden bg-zinc-100 shrink-0">
                            <Image
                              src={imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="font-medium">
                            {item.name} – {item.price} ден
                          </p>
                          <ul className="ml-4 list-disc text-xs text-gray-700">
                            {item.sizes.map((s, j) => (
                              <li key={j}>
                                Големина {s.size}: {s.quantity} парчиња
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <p className="mt-4 font-bold">Вкупна сума: {total} ден</p>

                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleAction(order._id, "accept")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Прифати
                  </button>
                  <button
                    onClick={() => handleAction(order._id, "decline")}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Одбиј
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
