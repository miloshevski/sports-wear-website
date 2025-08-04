"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ product }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: product._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const imagePublicId = product.images?.[0]; // first image only
  const imageUrl = imagePublicId
    ? `https://res.cloudinary.com/dh6mjupoi/image/upload/w_100,h_100,c_fill/${imagePublicId}.jpg`
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded shadow mb-2 cursor-move flex items-center gap-4"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          className="w-16 h-16 object-cover rounded"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
          no image
        </div>
      )}
      <div>
        <p className="font-semibold">{product.name}</p>
        <p className="text-sm text-gray-500">Order: {product.order}</p>
      </div>
    </div>
  );
}

export default function AdminProductPage() {
  const [products, setProducts] = useState([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    console.log("📦 Fetching products...");
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.order - b.order); // ✅ important fix
        console.log(
          "✅ Products sorted by order:",
          sorted.map((p) => `${p.name} (${p.order})`)
        );
        setProducts(sorted);
      });
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p._id === active.id);
    const newIndex = products.findIndex((p) => p._id === over.id);

    console.log("🔁 Dragged:", active.id);
    console.log("🔁 Dropped on:", over.id);
    console.log(`🔁 Moving from index ${oldIndex} to ${newIndex}`);

    const reordered = arrayMove(products, oldIndex, newIndex);
    setProducts(reordered); // optimistic update

    const payload = { orderedIds: reordered.map((p) => p._id) };
    console.log("📤 Sending to server:", payload);

    try {
      const res = await fetch("/api/admin/reorder-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("✅ Server response:", result);

      if (!res.ok) {
        console.error("❌ Server failed. Reverting.");
        setProducts(products); // revert
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setProducts(products); // revert
    }
  };

  return (
    <main className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">🛠️ Подреди Производи</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={products.map((p) => p._id)}
          strategy={verticalListSortingStrategy}
        >
          {products.map((product) => (
            <SortableItem key={product._id} product={product} />
          ))}
        </SortableContext>
      </DndContext>
    </main>
  );
}
