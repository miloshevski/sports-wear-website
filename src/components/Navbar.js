"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-zinc-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          🚴‍♂️ CycleFit
        </Link>
        <ul className="flex gap-6 text-zinc-700 dark:text-zinc-200 font-medium">
          <li>
            <Link href="/products">Shop</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
