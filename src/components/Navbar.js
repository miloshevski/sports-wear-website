"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/useCart";
import { useSession } from "next-auth/react"; // Removed signOut

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-black">
          Спортска Опрема
        </Link>

        {/* Mobile menu button */}
        <button
          className="sm:hidden text-zinc-700 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <ul className="hidden sm:flex gap-6 text-zinc-700 font-medium items-center">
          <li>
            <Link href="/">Дома</Link>
          </li>
          <li>
            <Link href="/shop">Продавница</Link>
          </li>
          <li className="relative">
            <Link href="/cart" className="flex items-center gap-1">
              🛒Кошничка
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
          <li>
            {session?.user ? (
              <Link
                href="/admin"
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-900 transition"
              >
                Админ
              </Link>
            ) : (
              <Link
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                href="/admin/login"
              >
                Најава
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="sm:hidden flex flex-col items-center gap-4 pb-4 text-zinc-700 font-medium bg-white border-t border-zinc-200">
          <li>
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Дома
            </Link>
          </li>
          <li>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>
              Продавница
            </Link>
          </li>
          <li className="relative">
            <Link href="/cart" onClick={() => setMenuOpen(false)}>
              🛒Кошничка
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
          <li>
            {session?.user ? (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-black border px-4 py-2 rounded hover:bg-gray-100"
              >
                Админ
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
              >
                Најава
              </Link>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
