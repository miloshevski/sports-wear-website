import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId
        );

        if (existingIndex !== -1) {
          const updated = [...items];
          updated[existingIndex].sizes = mergeSizes(
            updated[existingIndex].sizes,
            item.sizes
          );
          set({ items: updated });
        } else {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId) => {
        const items = get().items.filter((i) => i.productId !== productId);
        set({ items });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    }
  )
);

function mergeSizes(existingSizes, newSizes) {
  const map = {};

  existingSizes.forEach(({ size, quantity }) => {
    map[size] = quantity;
  });

  newSizes.forEach(({ size, quantity }) => {
    if (map[size]) {
      map[size] += quantity;
    } else {
      map[size] = quantity;
    }
  });

  return Object.entries(map).map(([size, quantity]) => ({ size, quantity }));
}
