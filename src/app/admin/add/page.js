"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [useOtherCategory, setUseOtherCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    sizes: [{ size: "", quantity: "" }],
    images: [],
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  if (!session?.user?.isAdmin) {
    return <p className="text-center mt-20 text-red-600">Access Denied</p>;
  }

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

    let finalCategory = form.category;

    // Handle dynamic category creation
    if (useOtherCategory && newCategory.trim()) {
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategory.trim() }),
        });
        const data = await res.json();
        finalCategory = data.name;
      } catch (err) {
        console.error("Category creation failed", err);
        alert("Could not create new category.");
        setUploading(false);
        return;
      }
    }

    try {
      const uploadedImages = await Promise.all(
        form.images.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "nextjs_shop");

          const res = await fetch(
            "https://api.cloudinary.com/v1_1/dh6mjupoi/image/upload",
            {
              method: "POST",
              body: data,
            }
          );

          if (!res.ok) throw new Error(await res.text());
          const json = await res.json();
          return json.public_id;
        })
      );

      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: finalCategory,
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
        alert("❌ Failed: " + (error.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("❌ Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow border my-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-zinc-800">
        Додади нов производ
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block mb-1 font-semibold">Име на производ</label>
          <input
            name="name"
            type="text"
            required
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Категорија</label>
            <select
              name="category"
              value={form.category}
              onChange={(e) => {
                if (e.target.value === "other") {
                  setUseOtherCategory(true);
                  setForm({ ...form, category: "" });
                } else {
                  setUseOtherCategory(false);
                  setForm({ ...form, category: e.target.value });
                }
              }}
              required={!useOtherCategory}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">Изберете категорија</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="other">Друго</option>
            </select>

            {useOtherCategory && (
              <input
                type="text"
                placeholder="New category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
                className="mt-2 w-full px-4 py-2 border rounded"
              />
            )}
          </div>

          <div>
            <label className="block mb-1 font-semibold">Цена (ден)</label>
            <input
              name="price"
              type="number"
              required
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-semibold">Опис</label>
          <textarea
            name="description"
            rows="3"
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Sizes & Quantities */}
        <div>
          <label className="block mb-2 font-semibold">Големини и количини</label>
          {form.sizes.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <select
                value={s.size}
                onChange={(e) => handleSizeChange(i, "size", e.target.value)}
                className="w-1/2 px-3 py-2 border rounded"
              >
                <option value="">Големина</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="2XL">2XL</option>
              </select>
              <input
                type="number"
                placeholder="Количина"
                value={s.quantity}
                onChange={(e) =>
                  handleSizeChange(i, "quantity", e.target.value)
                }
                className="w-1/2 px-3 py-2 border rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addSizeField}
            className="text-sm text-blue-600 hover:underline mt-1"
          >
            + Додади големина
          </button>
        </div>

        {/* Images */}
        <div>
          <label className="block mb-2 font-semibold">Слики од производот</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          {uploading ? "Се додава..." : "Додади производ"}
        </button>
      </form>
    </div>
  );
}
