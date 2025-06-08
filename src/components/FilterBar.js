"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FilterBar({ category }) {
  const router = useRouter();
  const params = useSearchParams();

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    router.push(`/products/${category}?${newParams.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Size filter */}
      <div>
        <label className="block text-sm font-medium">Size</label>
        <select
          defaultValue={params.get("size") || ""}
          onChange={(e) => updateFilter("size", e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">All</option>
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
          <option value="XL">X-Large</option>
        </select>
      </div>

      {/* Price filter */}
      <div>
        <label className="block text-sm font-medium">Max Price</label>
        <input
          type="number"
          placeholder="e.g. 50"
          min="0"
          defaultValue={params.get("maxPrice") || ""}
          onBlur={(e) => updateFilter("maxPrice", e.target.value)}
          className="border px-2 py-1 rounded w-32"
        />
      </div>
    </div>
  );
}
