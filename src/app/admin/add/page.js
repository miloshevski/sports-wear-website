"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    sizes: [{ size: "", quantity: "" }],
    images: [],
  });

  const [uploading, setUploading] = useState(false);

  if (!session?.user?.isAdmin)
    return <p className="text-center mt-20 text-red-600">Access Denied</p>;

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...form.sizes];
    newSizes[index][field] = value;
    setForm({ ...form, sizes: newSizes });
  };

  const addSizeField = () => {
    setForm({ ...form, sizes: [...form.sizes, { size: "", quantity: "" }] });
  };

  const handleImagesChange = (e) => {
    setForm({ ...form, images: [...e.target.files] });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);

  try {
    const uploadedImages = await Promise.all(
      form.images.map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "nextjs_shop"); // Use your preset

        const res = await fetch("https://api.cloudinary.com/v1_1/dh6mjupoi/image/upload", {
          method: "POST",
          body: data,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error("Cloudinary upload failed:\n" + errorText);
        }

        const json = await res.json();
        return json.public_id; // Store this in DB
      })
    );

    // Send product to your backend with image public IDs
    const productRes = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        description: form.description,
        sizes: form.sizes.map((s) => ({
          size: s.size,
          quantity: parseInt(s.quantity),
        })),
        images: uploadedImages,
      }),
    });

    if (productRes.ok) {
      alert("✅ Product added!");
      router.push("/shop");
    } else {
      const error = await productRes.json();
      alert("❌ Failed to add product: " + (error.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Upload failed", err);
    alert(err.message || "❌ Something went wrong during upload.");
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow border my-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-zinc-800">
        Add New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">
            Product Name
          </label>
          <input
            name="name"
            type="text"
            required
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-zinc-800"
          />
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Category
            </label>
            <input
              name="category"
              type="text"
              required
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-zinc-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">
              Price (€)
            </label>
            <input
              name="price"
              type="number"
              required
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-zinc-800"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-zinc-800"
          />
        </div>

        {/* Sizes & Quantities */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">
            Sizes & Quantities
          </label>
          {form.sizes.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select
                value={s.size}
                onChange={(e) => handleSizeChange(i, "size", e.target.value)}
                className="w-1/2 px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800"
              >
                <option value="">Select size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
              <input
                type="number"
                placeholder="Qty"
                value={s.quantity}
                onChange={(e) =>
                  handleSizeChange(i, "quantity", e.target.value)
                }
                className="w-1/2 px-3 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addSizeField}
            className="text-sm text-blue-600 hover:underline mt-1"
          >
            + Add Size
          </button>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 mb-2">
            Product Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            className="block w-full border border-zinc-300 px-3 py-2 rounded-md text-sm text-zinc-800 bg-white"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-all duration-150"
        >
          {uploading ? "Uploading..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
