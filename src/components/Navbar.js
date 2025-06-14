"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-black-600">
          Спортска Опрема
        </Link>
        <ul className="flex gap-6 text-zinc-700 font-medium">
          <li>
            <Link href="/shop">Продавница</Link>
          </li>
          <li>
            <Link href="/contact">Контакт</Link>
          </li>
          <li>
            <Link href="/about">За Нас</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
