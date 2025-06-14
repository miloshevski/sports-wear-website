"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/useCart";
import { useRouter } from "next/navigation";

export default function OrderPage() {
  const { cart, clearCart } = useCart();
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const totalItems = cart.reduce(
    (sum, item) => sum + item.sizes.reduce((s, sz) => s + sz.quantity, 0),
    0
  );

  const totalPrice = cart.reduce((total, item) => {
    return (
      total + item.sizes.reduce((sum, s) => sum + s.quantity * item.price, 0)
    );
  }, 0);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !customer.name ||
      !customer.address ||
      !customer.phone ||
      !customer.email
    ) {
      alert("Пополнете ги сите полиња.");
      return;
    }

    if (cart.length === 0) {
      alert("Кошничката е празна.");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer, items: cart }),
    });

    setSubmitting(false);

    if (res.ok) {
      alert("Нарачката е успешно испратена!");
      clearCart();
      router.push("/shop");
    } else {
      alert("Грешка при нарачување.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Нарачај</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Име и презиме"
          value={customer.name}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <input
          name="address"
          placeholder="Адреса"
          value={customer.address}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <input
          name="phone"
          placeholder="Телефон"
          value={customer.phone}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={customer.email}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />

        <h2 className="text-lg font-semibold mt-6">Кошничка</h2>
        {cart.length === 0 ? (
          <p>Немате производи во кошничката.</p>
        ) : (
          <ul className="border rounded p-2 space-y-2">
            {cart.map((item, idx) => (
              <li key={idx}>
                <span className="font-semibold">{item.name}</span> –{" "}
                {item.sizes.map((s, i) => (
                  <span key={i}>
                    {s.size} ({s.quantity})
                    {i < item.sizes.length - 1 ? ", " : ""}
                  </span>
                ))}{" "}
                <span className="text-gray-500 ml-2">
                  ={" "}
                  {item.sizes.reduce(
                    (sum, s) => sum + s.quantity * item.price,
                    0
                  )}{" "}
                  ден
                </span>
              </li>
            ))}
            <li className="mt-2 font-bold">Вкупно производи: {totalItems}</li>
            <li className="font-bold text-lg">Вкупна сума: {totalPrice} ден</li>
          </ul>
        )}

        <button
          type="submit"
          className="mt-4 bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          disabled={submitting}
        >
          {submitting ? "Се испраќа..." : "Испрати нарачка"}
        </button>
      </form>
    </div>
  );
}
