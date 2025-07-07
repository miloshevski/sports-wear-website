"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

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

  const handlePrint = (id) => {
    const element = document.getElementById(`print-${id}`);
    if (!element) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Печатење нарачка</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
              color: #333;
            }
            h2 {
              text-align: center;
              font-size: 20px;
              margin-bottom: 20px;
              text-transform: uppercase;
            }
            .info, .products, .total {
              margin-bottom: 20px;
            }
            .info p, .products p {
              margin: 2px 0;
            }
            ul {
              list-style: none;
              padding-left: 0;
            }
            .products li {
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .total {
              font-size: 16px;
              font-weight: bold;
              text-align: right;
            }
            .print-footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
          <div class="print-footer">
            <p>Ви благодариме за вашата нарачка!</p>
            <p>www.sportskaoprema.mk</p>
          </div>
          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = function () { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const confirmAction = (id, action) => {
    toast.custom((t) => (
      <div className="bg-white border shadow-md rounded p-4 w-full max-w-xs">
        <p className="text-sm text-gray-800">
          Дали сте сигурни дека сакате да{" "}
          <strong>{action === "accept" ? "прифатите" : "одбиете"}</strong>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-sm text-gray-600 hover:underline"
          >
            Откажи
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleAction(id, action);
            }}
            className={`text-sm text-white px-3 py-1 rounded ${
              action === "accept"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Потврди
          </button>
        </div>
      </div>
    ));
  };

  const handleAction = async (id, action) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      setOrders((prev) => prev.filter((order) => order._id !== id));
      toast.success(
        action === "accept"
          ? "✅ Нарачката е прифатена."
          : "❌ Нарачката е одбиена."
      );
    } else {
      toast.error("Продуктот го нема на залиха. Автоматски одбиено.");
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
                {/* 👇 Content to print */}
                <div id={`print-${order._id}`} className="hidden print:block">
                  <h2>Нарачка</h2>
                  <div className="info">
                    <p>
                      <strong>Име:</strong> {order.name}
                    </p>
                    <p>
                      <strong>Адреса:</strong> {order.address}
                    </p>
                    <p>
                      <strong>Телефон:</strong> {order.phone}
                    </p>
                    <strong>
                      <p className="mt-4 font-bold">Вкупна сума: {total} ден</p>
                    </strong>
                  </div>
                  <div className="products">
                    <p className="font-semibold mt-4">Производи:</p>
                    <ul className="mt-2">
                      {order.cart.map((item, i) => (
                        <li key={i}>
                          <p>
                            {item.name} – {item.price} ден
                          </p>
                          <ul>
                            {item.sizes.map((s, j) => (
                              <li key={j}>
                                Големина {s.size}: {s.quantity} парчиња
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 👇 Display content */}
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

                <p className="font-semibold mt-2">Производи:</p>
                <ul className="space-y-4 mt-2 ml-2">
                  {order.cart.map((item, i) => {
                    const imageUrl = getImageUrl(item.images?.[0]);
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
                    onClick={() => confirmAction(order._id, "accept")}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Прифати
                  </button>
                  <button
                    onClick={() => confirmAction(order._id, "decline")}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Одбиј
                  </button>
                  <button
                    onClick={() => handlePrint(order._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Печати
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
