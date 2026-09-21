// Server-side helpers for the FastAuth API (only imported from route handlers).
import { env } from "@/config/env";
import { getProduct } from "@/lib/products";

export type CartLine = { id: string; qty: number };

export const generateOrderRef = () => `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

// Prices come from the server-side catalog, never from the client
export const buildItems = (lines: unknown) =>
  (Array.isArray(lines) ? (lines as CartLine[]) : []).flatMap((line) => {
    const product = getProduct(line?.id);
    const qty = Math.floor(Number(line?.qty));
    if (!product || !(qty >= 1)) return [];

    return [
      {
        name: product.name,
        sku: product.sku,
        image_url: product.image,
        product_ref: product.id,
        desc: product.desc,
        qty,
        unit_price: product.price.toFixed(2),
        discount_type: "fixed",
        discount_value: 0,
        tax_type: "fixed",
        tax_value: 0,
        metadata: { category: product.category },
      },
    ];
  });

// POSTs to the FastAuth API and maps the cart response for the frontend
export async function sendCart(path: string, payload: object) {
  if (!env.apiKey) {
    return Response.json(
      { success: false, message: "API key is not set in src/config/env.ts" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${env.apiUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": env.apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);
    const cartId = json?.results?.data?.cartId;

    if (!res.ok || !json?.success || !cartId) {
      return Response.json(
        {
          success: false,
          message: json?.message ?? "FastAuth cart request failed",
          errors: json?.errors ?? [],
        },
        { status: res.ok ? 502 : res.status }
      );
    }

    const checkoutUrl = `${env.checkoutUrl}?cart_id=${encodeURIComponent(cartId)}&apiKey=${encodeURIComponent(env.apiKey)}`;

    return Response.json({
      success: true,
      cartId,
      orderRef: json.results.data.orderRef,
      netTotal: json.results.data.cart?.netTotal,
      checkoutUrl,
    });
  } catch {
    return Response.json(
      { success: false, message: "Could not reach FastAuth API" },
      { status: 502 }
    );
  }
}
