"use client";

import { useEffect, useState } from "react";

type Props = {
  checkoutUrl: string;
  cartId: string;
  onClose: () => void;
};

export default function CheckoutModal({ checkoutUrl, cartId, onClose }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Log events posted by the FastAuth checkout iframe
    const checkoutOrigin = new URL(checkoutUrl).origin;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== checkoutOrigin) return;
      console.log("[FastAuth checkout]", e.data);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("message", onMessage);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("message", onMessage);
    };
  }, [checkoutUrl, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0 sm:p-6">
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[92vh] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <div>
            <h2 className="font-semibold">Secure Checkout</h2>
            <p className="font-mono text-xs text-zinc-500">{cartId}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            &times;
          </button>
        </div>

        <div className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
            </div>
          )}
          <iframe
            src={checkoutUrl}
            title="FastAuth Checkout"
            allow="payment"
            onLoad={() => setLoading(false)}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
