"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Loaded product from DB:", data);
        setProduct(data);
      });
  }, [id]);

  const handleChangeSizeQty = (index, field, value) => {
    const updatedSizes = [...product.sizes];
    updatedSizes[index][field] =
      field === "quantity" ? parseInt(value) || 0 : value;
    setProduct({ ...product, sizes: updatedSizes });
  };

  const handleAddSize = () => {
    setProduct({
      ...product,
      sizes: [...product.sizes, { size: "", quantity: 0 }],
    });
  };

  const handleRemoveSize = (index) => {
    const updatedSizes = product.sizes.filter((_, i) => i !== index);
    setProduct({ ...product, sizes: updatedSizes });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "nextjs_shop");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dh6mjupoi/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.public_id) throw new Error("No public_id in Cloudinary response");

      const updatedImages = [...(product.images || []), data.public_id];
      const updatedProduct = { ...product, images: updatedImages };
      setProduct(updatedProduct);

      const saveRes = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      const saveData = await saveRes.json();
      console.log("💾 Saved image update:", saveData);

      if (!saveRes.ok) {
        alert("❌ Failed to save image to DB.");
      }
    } catch (err) {
      console.error("❌ Upload error", err);
      alert("❌ Error uploading image.");
    }
  };

  const handleDeleteImage = async (publicId) => {
    const updated = product.images.filter((img) => img !== publicId);
    const updatedProduct = { ...product, images: updated };
    setProduct(updatedProduct);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      const response = await res.json();
      console.log("🗑 Image removed and saved:", response);

      if (!res.ok) {
        alert("❌ Failed to delete image in database.");
      }
    } catch (err) {
      console.error("Error removing image from DB", err);
      alert("❌ Error occurred while deleting image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submitting full product update:", product);

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    const result = await res.json();
    console.log("🧾 Server response:", result);

    if (res.ok) {
      router.push("/shop");
    } else {
      alert("❌ Failed to update product: " + result?.error);
    }
  };

  if (!product) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">🛠 Уреди Продукт</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Име на продукт"
          className="w-full border p-2 rounded"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
        />

        <textarea
          placeholder="Опис"
          className="w-full border p-2 rounded"
          value={product.description}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Цена"
          className="w-full border p-2 rounded"
          value={product.price}
          onChange={(e) =>
            setProduct({ ...product, price: parseFloat(e.target.value) })
          }
        />

        <input
          type="text"
          placeholder="Категорија"
          className="w-full border p-2 rounded"
          value={product.category}
          onChange={(e) => setProduct({ ...product, category: e.target.value })}
        />

        {/* Sizes */}
        <div>
          <label className="block font-medium mb-1">Големини и количини:</label>
          {product.sizes.map((s, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Големина"
                className="border p-1 rounded w-24"
                value={s.size}
                onChange={(e) =>
                  handleChangeSizeQty(index, "size", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Количина"
                className="border p-1 rounded w-24"
                value={s.quantity}
                onChange={(e) =>
                  handleChangeSizeQty(index, "quantity", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => handleRemoveSize(index)}
                className="text-red-600 text-sm"
              >
                ✖
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSize}
            className="text-sm text-blue-600 mt-1"
          >
            ➕ Додај големина
          </button>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium mb-1">Слики:</label>
          <div className="flex flex-wrap gap-3">
            {product.images?.map((img) => (
              <div key={img} className="relative w-24 h-24">
                <Image
                  src={`https://res.cloudinary.com/dh6mjupoi/image/upload/w_300,f_auto/${img}`}
                  alt="Product image"
                  fill
                  sizes="96px"
                  className="object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="bg-gray-200 text-sm text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          💾 Зачувај Промени
        </button>
      </form>
    </div>
  );
}
