"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  const { data: session } = useSession();
  const cloudName = "dh6mjupoi";
  const images = product.images || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

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
        alert("Product deleted.");
        setVisible(false);
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting product.");
    }
  };

  if (!visible) return null;

  return (
    <div className="w-full max-w-[500px] bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      {/* Image Slider */}
      <div className="relative w-full h-[280px] bg-zinc-100">
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
      <div className="p-4">
        <h2 className="text-lg font-semibold text-zinc-800">{product.name}</h2>
        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        <p className="text-base font-bold text-zinc-900 mt-1">
          {product.price} Ден.
        </p>

        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Sizes:</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map((s) => (
              <span
                key={s._id}
                className="border border-zinc-300 px-2 py-1 text-xs rounded bg-gray-50"
              >
                {s.size} ({s.quantity})
              </span>
            ))}
          </div>
        </div>

        {/* Admin Delete Button */}
        {session?.user?.isAdmin && (
          <button
            onClick={handleDelete}
            className="mt-4 text-sm text-red-600 hover:underline"
          >
            🗑 Delete Product
          </button>
        )}

        {/* Нарачај Button */}
        <Link
          href={`/products/${product._id}`}
          className="mt-4 block text-center bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
        >
          Нарачај
        </Link>
      </div>
    </div>
  );
}
