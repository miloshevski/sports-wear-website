"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      const res = await fetch("/api/orders/history");
      const data = await res.json();

      setOrders(data);

      const accepted = data.filter((o) => o.status === "accepted");

      setTotalProfit(accepted.reduce((sum, o) => sum + o.total, 0));

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const monthly = accepted.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      setMonthlyProfit(monthly.reduce((sum, o) => sum + o.total, 0));

      const monthMap = Array.from({ length: 12 }, (_, i) => ({
        name: new Date(0, i).toLocaleString("mk-MK", { month: "short" }),
        profit: 0,
      }));

      for (const o of accepted) {
        const d = new Date(o.createdAt);
        const month = d.getMonth();
        monthMap[month].profit += o.total;
      }

      setMonthlyData(monthMap);
    }

    fetchHistory();
  }, []);

  const handlePrint = (id) => {
    const el = document.getElementById(`history-print-${id}`);
    if (!el) return;

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
          ${el.innerHTML}
          <div class="print-footer">
            <p>Ви благодариме за вашата нарачка!</p>
            <p>www.sportskaoprema.mk</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6">📦 Историја на Нарачки</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Вкупна добивка
          </h2>
          <p className="text-2xl font-bold text-green-500">{totalProfit} ден</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Добивка овој месец
          </h2>
          <p className="text-2xl font-bold text-blue-500">
            {monthlyProfit} ден
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-10">
        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
          📊 Добивка по Месеци
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className={`border-l-8 p-4 rounded-2xl shadow-lg transition-all duration-200 ${
              order.status === "accepted"
                ? "border-green-500 bg-white dark:bg-gray-800"
                : "border-red-500 bg-white dark:bg-gray-800"
            }`}
          >
            <div id={`history-print-${order._id}`}>
              <h2 className="text-lg font-bold mb-4">Нарачка</h2>

              <div className="info text-sm mb-4">
                <p>
                  <strong>Име:</strong> {order.name}
                </p>
                <p>
                  <strong>Адреса:</strong> {order.address}
                </p>
                <p>
                  <strong>Телефон:</strong> {order.phone}
                </p>
              </div>

              <strong>
                {" "}
                <p className="font-bold text-md mb-4">
                  Вкупна сума: {order.total} ден
                </p>
              </strong>

              <div className="products text-sm">
                <p className="font-semibold mb-2">Производи:</p>
                <ul className="list-disc list-inside">
                  {order.products.map((p, i) => (
                    <li key={i}>
                      {p.name} – {p.size} ({p.quantity})
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {new Date(order.createdAt).toLocaleString("mk-MK")}
              </p>
            </div>

            <button
              onClick={() => handlePrint(order._id)}
              className="mt-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              🖨️ Печати
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
