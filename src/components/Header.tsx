"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-black.png" alt={site.name} width={130} height={35} priority />
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
            Shop
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900">
            Products
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            Cart
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1 text-xs">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
