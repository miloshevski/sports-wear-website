"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/useCart";
import { toast } from "react-hot-toast";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

export default function ProductCard({ product, onReorder, isFirst, isLast }) {
  const { data: session } = useSession();
  const { addItem } = useCart();
  const cloudName = "dh6mjupoi";
  const images = product.images || [];
  const [visible, setVisible] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  const sizeRank = (size) => {
    const i = sizeOrder.indexOf(size);
    return i === -1 ? 999 : i;
  };

  const sortedSizes = useMemo(() => {
    const list = Array.isArray(product.sizes) ? product.sizes : [];
    return [...list].sort((a, b) => sizeRank(a.size) - sizeRank(b.size));
  }, [product.sizes]);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  const totalStock =
    product.sizes?.reduce((sum, s) => sum + s.quantity, 0) ?? 0;
  const outOfStock = totalStock === 0;

  const getImageUrl = (publicId) =>
    `https://res.cloudinary.com/${cloudName}/image/upload/w_600,c_fit,f_auto,q_auto/${publicId}`;

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
      {/* Slider */}
      <div className="relative h-64 bg-white flex items-center justify-center">
        <div ref={sliderRef} className="keen-slider h-64">
          {images.length > 0 ? (
            images.map((img, index) => (
              <div
                key={index}
                className="keen-slider__slide flex justify-center items-center"
              >
                <Image
                  src={getImageUrl(img)}
                  alt={product.name}
                  width={300}
                  height={250}
                  className="object-contain w-full h-64"
                />
              </div>
            ))
          ) : (
            <div className="keen-slider__slide flex justify-center items-center">
              <Image
                src="/placeholder.jpg"
                alt="No image"
                width={300}
                height={250}
                className="object-contain w-full h-64"
              />
            </div>
          )}
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => instanceRef.current?.prev()}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition hidden sm:block"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={() => instanceRef.current?.next()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition hidden sm:block"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {images.length > 1 && (
        <div className="flex justify-center mt-2 mb-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => instanceRef.current?.moveToIdx(index)}
              className={`h-2 w-2 mx-1 rounded-full transition ${
                currentSlide === index ? "bg-blue-600 scale-125" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Info */}
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

        {!outOfStock && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Одбери големина:
            </p>

            {/* Size buttons (sorted) */}
            <div className="flex flex-wrap gap-2 mb-4">
              {sortedSizes.map((s) => {
                const isSelected = quantities[s.size] > 0;
                return (
                  <button
                    key={s._id}
                    type="button"
                    disabled={s.quantity === 0}
                    onClick={() =>
                      setQuantities((prev) => ({
                        ...prev,
                        [s.size]: prev[s.size] > 0 ? 0 : 1,
                      }))
                    }
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

            {/* Quantity selectors (sorted by size order as well) */}
            {Object.entries(quantities)
              .filter(([, qty]) => qty > 0)
              .sort(([sizeA], [sizeB]) => sizeRank(sizeA) - sizeRank(sizeB))
              .map(([size]) => {
                const maxQty =
                  product.sizes.find((s) => s.size === size)?.quantity || 1;
                return (
                  <div
                    key={size}
                    className="flex items-center gap-2 text-sm mb-2"
                  >
                    <label className="w-24">{size} количина:</label>
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
