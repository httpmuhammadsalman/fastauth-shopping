import { buildItems, sendCart } from "@/lib/fastauth";

// Update cart - only the changed object (cart.items) is sent
export async function POST(request: Request, { params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params;
  if (!/^CART[A-Z0-9]+$/i.test(cartId)) {
    return Response.json({ success: false, message: "Invalid cart id" }, { status: 422 });
  }

  const body = await request.json().catch(() => null);
  const items = buildItems(body?.items);

  if (items.length === 0) {
    return Response.json({ success: false, message: "Cart is empty" }, { status: 422 });
  }

  return sendCart(`/orders/carts/${cartId}/update`, { cart: { items } });
}
