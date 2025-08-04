"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CategoryScroll() {
  const [categories, setCategories] = useState([]);
  const pathname = usePathname();

  if (pathname !== "/") return null;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="w-full bg-white border-t border-b border-zinc-200 shadow-sm overflow-x-auto">
      <div className="flex gap-4 px-4 py-3 whitespace-nowrap">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/shop?category=${encodeURIComponent(cat.name)}`}
            className="text-sm sm:text-base text-zinc-700 hover:text-blue-600 font-medium px-4 py-1 border border-zinc-300 rounded-full transition shrink-0"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
