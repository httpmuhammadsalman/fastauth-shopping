"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-zinc-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {product.category}
        </span>
        <h3 className="font-semibold">{product.name}</h3>
        <p className="flex-1 text-sm text-zinc-500">{product.desc}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
          >
            {added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
