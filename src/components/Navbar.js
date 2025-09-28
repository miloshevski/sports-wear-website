"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/useCart";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, mounted } = useCart();
  const { data: session } = useSession();

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
          Спортска Опрема
        </Link>

        {/* Кошничка за мобилен (секогаш видлива) */}
        <div className="flex items-center gap-4 sm:hidden">
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-blue-600 flex items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M13 13v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6m8 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4.1" />
            </svg>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-lg">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu button */}
          <button
            className="text-gray-700 hover:text-blue-600 focus:outline-none p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
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
        </div>

        {/* Desktop nav */}
        <ul className="hidden sm:flex gap-8 text-gray-700 font-medium items-center">
          <li>
            <Link href="/" className="hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">Дома</Link>
          </li>
          <li>
            <Link href="/shop" className="hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">Продавница</Link>
          </li>
          <li className="relative">
            <Link href="/cart" className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M13 13v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6m8 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4.1" />
              </svg>
              Кошничка
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
          <li>
            {session?.user ? (
              <Link
                href="/admin"
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-5 py-2.5 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                Админ
              </Link>
            ) : (
              <Link
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                href="/admin/login"
              >
                Најава
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Mobile dropdown nav */}
      {menuOpen && (
        <ul className="sm:hidden flex flex-col items-center gap-4 pb-6 pt-4 text-gray-700 font-medium bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
          <li>
            <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-blue-600 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-50">
              Дома
            </Link>
          </li>
          <li>
            <Link href="/shop" onClick={() => setMenuOpen(false)} className="hover:text-blue-600 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-50">
              Продавница
            </Link>
          </li>
          <li>
            <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M13 13v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-6m8 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4.1" />
              </svg>
              Кошничка
              {mounted && cartCount > 0 && (
                <span className="ml-1 inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-lg">
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
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg font-medium"
              >
                Админ
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-medium"
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
