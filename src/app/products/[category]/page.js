// /app/products/[category]/page.js

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import FilterBar from "@/components/FilterBar";

export default function CategoryPage() {
  const params = useParams(); // ✅ Correct hook in client component
  const searchParams = useSearchParams();

  const category = params.category;
  const size = searchParams.get("size");
  const maxPrice = searchParams.get("maxPrice");

  const filtered = products.filter(
    (p) =>
      p.category === category &&
      (!size || p.size.includes(size)) &&
      (!maxPrice || p.price <= parseFloat(maxPrice))
  );

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-6 capitalize">{category}</h1>

      <FilterBar category={category} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="text-zinc-500">No products match your filters.</p>
        )}
      </div>
    </div>
  );
}
