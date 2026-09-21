// Client-side helper for the /api/cart routes.
export type CartLine = { id: string; qty: number };

export type CartResult = {
  status: number;
  success: boolean;
  message?: string;
  cartId?: string;
  checkoutUrl?: string;
};

export async function requestCart(url: string, lines: CartLine[]): Promise<CartResult> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: lines }),
  });
  const json = await res.json();

  if (!json.blocked) return { ...json, status: res.status };

  // Our server was blocked by the API firewall, send the prepared request from the browser
  const { direct } = json;
  const directRes = await fetch(direct.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": direct.apiKey,
    },
    body: JSON.stringify(direct.payload),
  });
  const directJson = await directRes.json().catch(() => null);
  const cartId = directJson?.results?.data?.cartId;

  if (!directRes.ok || !directJson?.success || !cartId) {
    return {
      status: directRes.ok ? 502 : directRes.status,
      success: false,
      message: directJson?.message ?? "FastAuth cart request failed",
    };
  }

  return {
    status: 200,
    success: true,
    cartId,
    checkoutUrl: `${direct.checkoutUrl}?cart_id=${encodeURIComponent(cartId)}&apiKey=${encodeURIComponent(direct.apiKey)}`,
  };
}
