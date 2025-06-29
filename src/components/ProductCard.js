"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/useCart";
import { toast } from "react-hot-toast";

export default function ProductCard({ product }) {
  const { data: session } = useSession();
  const { addItem } = useCart();
  const cloudName = "dh6mjupoi";
  const images = product.images || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [quantities, setQuantities] = useState({});

  const totalStock = product.sizes?.reduce((sum, s) => sum + s.quantity, 0);
  const outOfStock = totalStock === 0;

  const getImageUrl = (publicId) => {
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_600,c_fit,f_auto,q_auto/${publicId}`;
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete product "${product.name}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("🗑 Продуктот е избришан.");
        setVisible(false);
      } else {
        toast.error("Неуспешно бришење.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Грешка при бришење.");
    }
  };

  const handleAddToCart = () => {
    const selectedSizes = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([size, quantity]) => {
        const matchingSize = product.sizes.find((s) => s.size === size);
        const available = matchingSize ? matchingSize.quantity : 0;
        return { size, quantity, available };
      });

    if (selectedSizes.length === 0) {
      toast.error("Избери барем една големина и количина.");
      return;
    }

    const overstocked = selectedSizes.find(
      ({ quantity, available }) => quantity > available
    );

    if (overstocked) {
      toast.error(
        `Нема доволно залиха за ${overstocked.size}. Максимум е ${overstocked.available}.`
      );
      return;
    }

    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      sizes: selectedSizes.map(({ size, quantity }) => ({ size, quantity })),
      images: product.images,
    };

    addItem(cartItem);
    toast.success("✅ Додадено во кошничка!");
  };

  if (!visible) return null;

  return (
    <div className="w-full max-w-[500px] bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Image Slider */}
      <div className="relative w-full h-[280px] bg-zinc-100 shrink-0">
        {outOfStock && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full z-20 shadow">
            ❌ Распродадено
          </span>
        )}
        {images.length > 0 ? (
          <>
            <Image
              src={getImageUrl(images[currentIndex])}
              alt={product.name}
              fill
              className="object-cover"
              loading="lazy"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full text-sm z-10"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white px-2 py-1 rounded-full text-sm z-10"
                >
                  ›
                </button>
              </>
            )}
          </>
        ) : (
          <Image
            src="/placeholder.jpg"
            alt="No image"
            fill
            className="object-contain"
          />
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col h-full">
        <h2 className="text-lg font-semibold text-zinc-800">{product.name}</h2>
        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        <p className="text-base font-bold text-zinc-900 mt-1">
          {product.price} Ден.
        </p>

        {product.description && (
          <p className="text-sm text-gray-700 mt-2 line-clamp-3 min-h-[3.6em]">
            {product.description}
          </p>
        )}

        {/* Size & Quantity Inputs */}
        {!outOfStock && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Одбери количина по големина:
            </p>
            {product.sizes.map((s) => (
              <div key={s._id} className="flex items-center gap-3 mt-2 text-sm">
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
                  className="border p-1 w-16 rounded"
                />
                <span className="text-xs text-gray-500">
                  {s.quantity} на залиха
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Push buttons to bottom */}
        <div className="flex-grow" />

        {/* Admin-only controls */}
        {session?.user?.isAdmin && (
          <div className="flex flex-col gap-1 mt-4">
            <Link
              href={`/admin/edit/${product._id}`}
              className="text-sm text-yellow-600 hover:underline"
            >
              ✏️ Edit Product
            </Link>
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:underline"
            >
              🗑 Delete Product
            </button>
          </div>
        )}

        {/* Add to cart / Out of stock */}
        {outOfStock ? (
          <button
            disabled
            className="mt-4 w-full text-center bg-gray-400 text-white px-4 py-2 rounded text-sm cursor-not-allowed"
          >
            ❌ Распродадено
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="mt-4 w-full text-center bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
          >
            ➕ Додај во кошничка
          </button>
        )}
      </div>
    </div>
  );
}
