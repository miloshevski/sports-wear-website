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

      // Build profit per month data
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
          <title>Печатење Историја</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
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

      {/* 📊 Monthly Profit Graph */}
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

      {/* 🧾 Order Cards */}
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
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{order.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.phone}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    order.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status === "accepted" ? "Прифатена" : "Одбиена"}
                </span>
              </div>
              <p className="text-sm mb-2 text-gray-600 dark:text-gray-300">
                {order.address}
              </p>
              <ul className="text-sm mb-3 text-gray-700 dark:text-gray-200 list-disc list-inside">
                {order.products.map((p, i) => (
                  <li key={i}>
                    {p.name} - {p.size} ({p.quantity})
                  </li>
                ))}
              </ul>
              <p className="font-semibold text-gray-900 dark:text-white">
                Вкупно: {order.total} ден
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(order.createdAt).toLocaleString("mk-MK")}
              </p>
            </div>

            {/* 🖨️ Print Button */}
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
