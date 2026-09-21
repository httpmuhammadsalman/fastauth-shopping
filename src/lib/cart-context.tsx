"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, type Product } from "@/lib/products";

type CartLine = { id: string; qty: number };

export type CartItem = { product: Product; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  // FastAuth cart created for this session, reused for updates until it is paid
  remoteCartId: string | null;
  setRemoteCartId: (cartId: string | null) => void;
};

const STORAGE_KEY = "fastauth-shopping-cart";
const REMOTE_CART_KEY = "fastauth-shopping-remote-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [remoteCartId, setRemoteCartId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setLines(JSON.parse(saved));
      setRemoteCartId(localStorage.getItem(REMOTE_CART_KEY));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      if (remoteCartId) localStorage.setItem(REMOTE_CART_KEY, remoteCartId);
      else localStorage.removeItem(REMOTE_CART_KEY);
    } catch {}
  }, [lines, remoteCartId, loaded]);

  const value = useMemo<CartContextValue>(() => {
    const items = lines.flatMap((line) => {
      const product = getProduct(line.id);
      return product ? [{ product, qty: line.qty }] : [];
    });

    return {
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.qty, 0),
      addItem: (id) =>
        setLines((prev) =>
          prev.some((l) => l.id === id)
            ? prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
            : [...prev, { id, qty: 1 }]
        ),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty < 1 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l))
        ),
      removeItem: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      clear: () => setLines([]),
      remoteCartId,
      setRemoteCartId,
    };
  }, [lines, remoteCartId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
