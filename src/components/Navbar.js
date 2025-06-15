"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
        <ul className="hidden sm:flex gap-6 text-zinc-700 font-medium">
          <li>
            <Link href="/shop">Продавница</Link>
          </li>
          <li>
            <Link href="/cart">🛒Кошничка</Link>
          </li>
        </ul>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="sm:hidden flex flex-col items-center gap-4 pb-4 text-zinc-700 font-medium bg-white border-t border-zinc-200">
          <li>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>
              Продавница
            </Link>
          </li>
          
          <li>
            <Link href="/cart" onClick={() => setMenuOpen(false)}>
              🛒Кошничка
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
