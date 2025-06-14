"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "@/lib/useCart";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setProduct(data);
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const selectedSizes = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([size, quantity]) => {
        const matchingSize = product.sizes.find((s) => s.size === size);
        const available = matchingSize ? matchingSize.quantity : 0;
        return { size, quantity, available };
      });

    if (selectedSizes.length === 0) {
      alert("Избери барем една големина и количина.");
      return;
    }

    const overstocked = selectedSizes.find(
      ({ quantity, available }) => quantity > available
    );

    if (overstocked) {
      alert(
        `Немаш доволно залиха за големина ${overstocked.size}. Максимум е ${overstocked.available}.`
      );
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      sizes: selectedSizes.map(({ size, quantity }) => ({ size, quantity })),
    };

    addItem(cartItem);

    alert("Додадено во кошничка!");
    router.push("/shop");
  };

  if (!product) return <p>Се вчитува...</p>;

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 border rounded bg-white">
      <h1 className="text-xl font-bold">{product.name}</h1>
      <p className="text-sm text-gray-600 capitalize">{product.category}</p>
      <p className="font-bold text-lg mt-2">${product.price}</p>

      <div className="mt-4">
        <p className="text-sm font-semibold">Одбери големина и количина:</p>
        {product.sizes.map((s) => (
          <div key={s._id} className="flex items-center gap-4 mt-2">
            <span className="w-10">{s.size}</span>
            <input
              type="number"
              min={0}
              max={s.quantity}
              value={quantities[s.size] || ""}
              onChange={(e) => {
                let input = parseInt(e.target.value) || 0;
                const clamped = Math.max(0, Math.min(input, s.quantity));

                setQuantities({
                  ...quantities,
                  [s.size]: clamped,
                });
              }}
              className="border p-1 w-16"
            />
            <span className="text-xs text-gray-500">
              {s.quantity} на залиха
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddToCart}
        className="mt-6 bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
      >
        Додади во кошничка
      </button>
    </div>
  );
}
