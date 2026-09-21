import { env } from "@/config/env";
import { getProduct } from "@/lib/products";

type CartLine = { id: string; qty: number };

const generateOrderRef = () => `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

export async function POST(request: Request) {
  const apiKey = env.apiKey;
  if (!apiKey) {
    return Response.json(
      { success: false, message: "API key is not set in src/config/env.ts" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const lines: CartLine[] = Array.isArray(body?.items) ? body.items : [];

  // Prices come from the server-side catalog, never from the client
  const items = lines.flatMap((line) => {
    const product = getProduct(line.id);
    const qty = Math.floor(Number(line.qty));
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

  if (items.length === 0) {
    return Response.json({ success: false, message: "Cart is empty" }, { status: 422 });
  }

  const payload = {
    order_ref: generateOrderRef(),
    currency: "USD",
    cart: {
      add_ons: [],
      fees: [],
      discounts: [],
      items,
      discount_amount: 0,
      tax_amount: 0,
    },
  };

  try {
    const res = await fetch(`${env.apiUrl}/orders/carts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-KEY": apiKey,
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
          message: json?.message ?? "Failed to create cart",
          errors: json?.errors ?? [],
        },
        { status: res.ok ? 502 : res.status }
      );
    }

    const checkoutUrl = `${env.checkoutUrl}?cart_id=${encodeURIComponent(cartId)}&apiKey=${encodeURIComponent(apiKey)}`;

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
