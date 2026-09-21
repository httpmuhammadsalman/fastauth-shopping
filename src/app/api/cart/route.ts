import { buildItems, generateOrderRef, sendCart } from "@/lib/fastauth";

// Create cart
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const items = buildItems(body?.items);

  if (items.length === 0) {
    return Response.json({ success: false, message: "Cart is empty" }, { status: 422 });
  }

  return sendCart("/orders/carts", {
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
  });
}
