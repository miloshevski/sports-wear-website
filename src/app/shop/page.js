"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function fetchData() {
      const productRes = await fetch("/api/products");
      const categoryRes = await fetch("/api/categories");

      const productsData = await productRes.json();
      const categoryData = await categoryRes.json();

      setProducts(productsData);
      setCategories(categoryData.map((c) => c.name));

      if (
        initialCategory &&
        categoryData.some((c) => c.name === initialCategory)
      ) {
        setSelectedCategories([initialCategory]);
        const filtered = productsData.filter(
          (product) => product.category === initialCategory
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(productsData);
      }
    }

    fetchData().catch(console.error);
  }, [initialCategory]);

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);

      const matchPrice = !maxPrice || product.price <= parseFloat(maxPrice);

      return matchCategory && matchPrice;
    });

    setFilteredProducts(filtered);
  }, [selectedCategories, maxPrice, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Suspense fallback={<div>Loading shop...</div>}>
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </Suspense>
  );
}
