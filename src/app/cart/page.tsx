"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import CheckoutModal, { type PaymentResult } from "@/components/CheckoutModal";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

type Checkout = { cartId: string; checkoutUrl: string };

export default function CartPage() {
  const { items, count, subtotal, setQty, removeItem, clear, remoteCartId, setRemoteCartId } = useCart();
  const lastSynced = useRef<{ signature: string; checkout: Checkout } | null>(null);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paid, setPaid] = useState<PaymentResult | null>(null);

  const closeCheckout = useCallback(() => setCheckout(null), []);

  const handlePaymentSuccess = useCallback(
    (result: PaymentResult) => {
      setCheckout(null);
      clear();
      // Paid cart is finished, next order creates a new one
      setRemoteCartId(null);
      lastSynced.current = null;
      setPaid(result);
    },
    [clear, setRemoteCartId]
  );

  const handleCheckout = async () => {
    const lines = items.map((item) => ({ id: item.product.id, qty: item.qty }));
    const signature = JSON.stringify(lines);

    // Nothing changed since the last sync, just reopen the checkout
    if (lastSynced.current?.signature === signature) {
      setCheckout(lastSynced.current.checkout);
      return;
    }

    setSubmitting(true);
    setError(null);

    const send = (url: string) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines }),
      });

    try {
      // Update the existing FastAuth cart, create one if there is none (or it no longer exists)
      let res = remoteCartId ? await send(`/api/cart/${remoteCartId}`) : await send("/api/cart");
      // FastAuth answers 400 (not 404) for an unknown cart
      if (remoteCartId && [400, 404].includes(res.status)) res = await send("/api/cart");
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message ?? "Something went wrong");
        return;
      }

      const nextCheckout = { cartId: json.cartId, checkoutUrl: json.checkoutUrl };
      lastSynced.current = { signature, checkout: nextCheckout };
      setRemoteCartId(json.cartId);
      setCheckout(nextCheckout);
    } catch {
      setError("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          &#10003;
        </div>
        <h1 className="text-2xl font-bold">{paid.message}</h1>
        <dl className="space-y-1 text-sm text-zinc-500">
          {paid.amount != null && (
            <div>
              Amount paid: <span className="font-semibold text-zinc-900">{formatPrice(paid.amount)}</span>
            </div>
          )}
          {paid.invoiceNo && (
            <div>
              Invoice: <span className="font-mono text-zinc-900">{paid.invoiceNo}</span>
            </div>
          )}
          {paid.trxId && (
            <div>
              Transaction: <span className="font-mono text-zinc-900">{paid.trxId}</span>
            </div>
          )}
        </dl>
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-zinc-500">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <button onClick={clear} className="text-sm text-zinc-500 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white lg:col-span-2">
          {items.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-4 p-4">
              <img
                src={product.image}
                alt={product.name}
                className="h-24 w-24 shrink-0 rounded-xl bg-zinc-100 object-cover"
              />

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-zinc-500">{product.desc}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(product.price * qty)}</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-zinc-300">
                    <button
                      onClick={() => setQty(product.id, qty - 1)}
                      aria-label="Decrease quantity"
                      className="h-8 w-8 rounded-full hover:bg-zinc-100"
                    >
                      &minus;
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{qty}</span>
                    <button
                      onClick={() => setQty(product.id, qty + 1)}
                      aria-label="Increase quantity"
                      className="h-8 w-8 rounded-full hover:bg-zinc-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-sm text-zinc-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Items ({count})</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Shipping</dt>
              <dd className="text-zinc-500">Calculated at checkout</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          {error && (
            <p className="mt-4 whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating order..." : "Checkout"}
          </button>
          <p className="mt-3 text-center text-xs text-zinc-500">Payments powered by FastAuth</p>
        </aside>
      </div>

      {checkout && (
        <CheckoutModal
          cartId={checkout.cartId}
          checkoutUrl={checkout.checkoutUrl}
          onClose={closeCheckout}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
