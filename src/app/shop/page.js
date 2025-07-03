"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("order");

  useEffect(() => {
    async function fetchData() {
      const productRes = await fetch("/api/products");
      const categoryRes = await fetch("/api/categories");

      const productsData = await productRes.json();
      const categoryData = await categoryRes.json();

      // ✅ Sort products by order before setting them
      const sortedProducts = productsData.sort((a, b) => b.order - a.order);
      setProducts(sortedProducts);
      setCategories(categoryData.map((c) => c.name));

      if (
        initialCategory &&
        categoryData.some((c) => c.name === initialCategory)
      ) {
        setSelectedCategories([initialCategory]);
        const filtered = sortedProducts.filter(
          (product) => product.category === initialCategory
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(sortedProducts);
      }
    }

    fetchData().catch(console.error);
  }, [initialCategory]);

  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchPrice = !maxPrice || product.price <= parseFloat(maxPrice);

      return matchCategory && matchPrice;
    });

    // 🔀 Sort based on the selected option
    switch (sortOption) {
      case "createdAt":
        filtered = [...filtered].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "priceAsc":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "order":
      default:
        filtered = [...filtered].sort((a, b) => b.order - a.order);
        break;
    }

    setFilteredProducts(filtered);
  }, [selectedCategories, maxPrice, products, sortOption]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleReorder = async (productId, direction) => {
    try {
      const res = await fetch("/api/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, direction }),
      });

      if (res.ok) {
        const updated = await fetch("/api/products");
        const updatedProducts = await updated.json();

        const sorted = updatedProducts.sort((a, b) => b.order - a.order);
        setProducts(sorted);
      }
    } catch (error) {
      console.error("Reordering failed:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Продавница</h1>

      <div className="flex flex-col md:flex-row gap-8 mb-6">
        <div>
          <h2 className="font-semibold mb-2">Категории</h2>
          {categories.map((category) => (
            <label key={category} className="block text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="mr-2"
              />
              {category}
            </label>
          ))}
        </div>

        <div>
          <h2 className="font-semibold mb-2">Макс Цена (МКД)</h2>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Внеси максимална цена"
            className="border border-gray-300 rounded px-3 py-1"
          />
        </div>
        <div className="mb-4">
          <label className="mr-2 font-semibold">Сортирај:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="order">Стандардно</option>
            <option value="createdAt">По датум на додавање</option>
            <option value="priceAsc">Цена растечки</option>
            <option value="priceDesc">Цена опаѓачки</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            onReorder={(dir) => handleReorder(product._id, dir)}
            isFirst={index === 0}
            isLast={index === filteredProducts.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ✅ Wrap in Suspense to fix Vercel error
export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
