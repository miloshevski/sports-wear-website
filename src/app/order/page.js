"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/useCart";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // ✅ Toast import

export default function OrderPage() {
  const { cart, clearCart } = useCart();
  const [customer, setCustomer] = useState({
    name: "",
    street: "",
    number: "",
    city: "",
    postalCode: "",
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
      !customer.street ||
      !customer.number ||
      !customer.city ||
      !customer.postalCode ||
      !customer.phone ||
      !customer.email
    ) {
      toast.error("Пополнете ги сите полиња.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Кошничката е празна.");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: customer.name,
        email: customer.email,
        address: `${customer.street} ${customer.number}, ${customer.city}, ${customer.postalCode}`,
        street: customer.street,
        number: customer.number,
        city: customer.city,
        postalCode: customer.postalCode,
        phone: customer.phone,
        cart,
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      toast.success("✅ Нарачката е успешно испратена!");
      clearCart();
      router.push("/shop");
    } else {
      toast.error("Грешка при нарачување.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Завршете нарачка
            </h1>
            <p className="text-gray-600">Пополнете ги деталите за достава</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Лични податоци
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Име и презиме</label>
                    <input
                      name="name"
                      placeholder="Внесете име и презиме"
                      value={customer.name}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="070 123 456"
                        value={customer.phone}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        value={customer.email}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Адреса за достава
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Улица</label>
                      <input
                        name="street"
                        placeholder="Ул. Македонија"
                        value={customer.street}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Број</label>
                      <input
                        name="number"
                        placeholder="123"
                        value={customer.number}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Град</label>
                      <input
                        name="city"
                        placeholder="Скопје"
                        value={customer.city}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Поштенски број</label>
                      <input
                        name="postalCode"
                        placeholder="1000"
                        value={customer.postalCode}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M13 13v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6m8 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4.1" />
                    </svg>
                    Преглед на нарачка
                  </h2>

                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M13 13v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6m8 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4.1" />
                      </svg>
                      <p className="text-gray-500 text-lg">Кошничката е празна</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                              <div className="flex flex-wrap gap-2">
                                {item.sizes.map((s, i) => (
                                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {s.size} × {s.quantity}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <span className="text-lg font-bold text-gray-800">
                                {item.sizes.reduce((sum, s) => sum + s.quantity * item.price, 0)} ден
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="border-t border-gray-200 pt-4 mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Вкупно производи:</span>
                          <span className="font-semibold">{totalItems}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-800">Вкупна сума:</span>
                          <span className="text-2xl font-bold text-blue-600">{totalPrice} ден</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-8 py-4 rounded-xl transition-all duration-200 border border-gray-300"
              >
                Назад
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-12 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={submitting || cart.length === 0}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Се испраќа...
                  </span>
                ) : (
                  "Потврди нарачка"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
