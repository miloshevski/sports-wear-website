"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/useCart";
import { toast } from "react-hot-toast";

export default function ProductCard({ product, onReorder, isFirst, isLast }) {
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
    <div className="relative w-full max-w-[500px] bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Image Slider */}
      <div className="relative w-full h-[280px] bg-zinc-100 shrink-0 flex items-center justify-center overflow-hidden">
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
              width={300}
              height={250}
              className="object-contain max-h-[260px]"
              loading="lazy"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-xl z-10 hover:bg-black/70 transition"
                >
                  ‹
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-xl z-10 hover:bg-black/70 transition"
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
            width={300}
            height={250}
            className="object-contain max-h-[260px]"
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

        {/* Sizes & Quantities */}
        {!outOfStock && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Одбери големина:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.sizes.map((s) => {
                const isSelected = quantities[s.size] > 0;
                return (
                  <button
                    key={s._id}
                    type="button"
                    disabled={s.quantity === 0}
                    onClick={() => {
                      setQuantities((prev) => ({
                        ...prev,
                        [s.size]: prev[s.size] > 0 ? 0 : 1,
                      }));
                    }}
                    className={`border rounded px-3 py-1 text-sm font-medium transition ${
                      s.quantity === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : isSelected
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-100 text-blue-700 border-blue-300"
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>

            {/* Quantity Dropdowns */}
            {Object.entries(quantities)
              .filter(([, qty]) => qty > 0)
              .map(([size]) => {
                const maxQty =
                  product.sizes.find((s) => s.size === size)?.quantity || 1;
                return (
                  <div
                    key={size}
                    className="flex items-center gap-2 text-sm mb-2"
                  >
                    <label className="w-20">{size} количина:</label>
                    <select
                      className="border rounded p-1"
                      value={quantities[size]}
                      onChange={(e) =>
                        setQuantities({
                          ...quantities,
                          [size]: parseInt(e.target.value),
                        })
                      }
                    >
                      {Array.from({ length: maxQty }, (_, i) => i + 1).map(
                        (val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                );
              })}
          </div>
        )}

        <div className="flex-grow" />

        {/* Admin-only buttons & reorder */}
        {session?.user?.isAdmin && (
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Link
                href={`/admin/edit/${product._id}`}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                🗑 Delete
              </button>
            </div>

            {/* Reorder buttons */}
            {onReorder && (
              <div className="flex gap-2">
                <button
                  disabled={isFirst}
                  onClick={() => onReorder("forward")}
                  className="text-2xl transition-transform duration-200 hover:scale-110 disabled:opacity-30"
                >
                  ⏪
                </button>

                <button
                  disabled={isLast}
                  onClick={() => onReorder("backward")}
                  className="text-2xl transition-transform duration-200 hover:scale-110 disabled:opacity-30"
                >
                  ⏩
                </button>
              </div>
            )}
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
            + Додај во кошничка
          </button>
        )}
      </div>
    </div>
  );
}
