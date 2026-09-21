# FastAuth Checkout Integration Guide

How to add FastAuth checkout to a storefront. This project is a working reference
implementation (Next.js), but the flow is the same for any stack.

## How it works

```
Your store                         FastAuth API                    FastAuth Checkout (iframe)
    |                                   |                                   |
    |-- 1. POST /orders/carts --------->|                                   |
    |<-------- cartId ------------------|                                   |
    |                                                                       |
    |-- 2. open iframe: /checkout?cart_id=...&apiKey=... ------------------>|
    |                                                                       |
    |        (customer changes the cart before paying)                      |
    |-- 3. POST /orders/carts/{cartId}/update -->|                          |
    |                                                                       |
    |<-- 4. window.postMessage({ status: "success", ... }) -----------------|
    |      close the iframe, empty the cart, show confirmation              |
```

Your store never touches card data. The customer enters address and payment details
inside the FastAuth iframe.

## Configuration

| Setting      | Value                                    |
| ------------ | ---------------------------------------- |
| API base URL | `https://api.paymentlync.com/v2/api`     |
| Checkout URL | `https://merchant.fastauth.net/checkout` |
| Auth header  | `X-API-KEY: <your api key>`              |

API keys are created in the FastAuth merchant dashboard.

In this project the values live in [`src/config/env.ts`](../src/config/env.ts) and can be
overridden with environment variables:

```
FASTAUTH_API_URL=https://api.paymentlync.com/v2/api
FASTAUTH_CHECKOUT_URL=https://merchant.fastauth.net/checkout
FASTAUTH_API_KEY=your_api_key
```

Locally put them in `.env.local`. On Vercel add them under
Project > Settings > Environment Variables, then redeploy.

## Step 1: Create a cart

`POST {API base URL}/orders/carts`

Headers:

```
Content-Type: application/json
Accept: application/json
X-API-KEY: <your api key>
```

Body:

```json
{
  "order_ref": "ORD-1789716985566-809",
  "currency": "USD",
  "cart": {
    "add_ons": [],
    "fees": [],
    "discounts": [],
    "items": [
      {
        "name": "Wireless Headphones",
        "sku": "HDP-001",
        "image_url": "https://example.com/headphones.jpg",
        "product_ref": "p-headphones",
        "desc": "Over-ear, noise cancelling, 30h battery",
        "qty": 1,
        "unit_price": "129.99",
        "discount_type": "fixed",
        "discount_value": 0,
        "tax_type": "fixed",
        "tax_value": 0,
        "metadata": { "category": "Audio" }
      }
    ],
    "discount_amount": 0,
    "tax_amount": 0
  }
}
```

Field rules:

| Field                                    | Rules                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `order_ref`                              | Your own order reference. Generate a unique one per order.                  |
| `currency`                               | 3-letter code, e.g. `USD`.                                                  |
| `cart.items[].name`                      | Required, max 120 characters.                                               |
| `cart.items[].sku`                       | Required, max 50 characters.                                                |
| `cart.items[].product_ref`               | Required, max 50 characters. Your product id.                               |
| `cart.items[].image_url`                 | Optional, max 255 characters. Shown on the checkout page.                   |
| `cart.items[].desc`                      | Optional, max 255 characters.                                               |
| `cart.items[].qty`                       | Required, integer, minimum 1.                                               |
| `cart.items[].unit_price`                | Required, number, minimum 0.001.                                            |
| `cart.items[].discount_type`, `tax_type` | Optional, `fixed` or `percentage`.                                          |
| `cart.items[].discount_value`, `tax_value` | Optional, number, minimum 0.                                              |
| `cart.items[].metadata`                  | Optional object. Returned to you unchanged.                                 |
| `cart.discounts[]`                       | Optional. Each needs `code`, `type` (`fixed`/`percentage`), `value`, `description`. |
| `cart.fees[]`                            | Optional. Each needs `type` (`fixed`/`percentage`), `value`, `description`. |
| `cart.add_ons[]`                         | Optional. Same shape as `cart.items[]`.                                     |
| `cart.discount_amount`, `cart.tax_amount` | Optional cart-level amounts, minimum 0.                                    |

Products are saved to your FastAuth catalog automatically, matched on `sku` + `name` + `product_ref`.

Response (keys come back in camelCase):

```json
{
  "status": true,
  "success": true,
  "statusCode": 200,
  "message": "Cart Created successfully",
  "results": {
    "data": {
      "cartId": "CART20260921DCA9ZKWP",
      "orderRef": "ORD-1789716985566-809",
      "currency": { "code": "USD", "symbol": "$" },
      "cart": {
        "items": [{ "id": "PROD20260908GOZRYTEM", "name": "Wireless Headphones", "qty": 1, "finalPrice": 129.99 }],
        "subTotal": 129.99,
        "discountAmount": 0,
        "taxAmount": 0,
        "shippingCost": 0,
        "netTotal": 129.99
      }
    }
  }
}
```

Keep `results.data.cartId`. You need it for the checkout URL and for updates.
A cart expires 7 days after it was last created or updated.

Reference code: [`src/app/api/cart/route.ts`](../src/app/api/cart/route.ts) and
[`src/lib/fastauth.ts`](../src/lib/fastauth.ts).

## Step 2: Open the checkout iframe

Build the URL from the cart id and your API key:

```
https://merchant.fastauth.net/checkout?cart_id=CART20260921DCA9ZKWP&apiKey=<your api key>
```

```html
<iframe src="CHECKOUT_URL" title="FastAuth Checkout" allow="payment" style="width:100%;height:100%;border:0"></iframe>
```

Show it in a full-height modal. Reference code:
[`src/components/CheckoutModal.tsx`](../src/components/CheckoutModal.tsx).

## Step 3: Listen for the payment result

When the payment completes, the checkout page posts a message to the parent window:

```js
{
  status: "success",
  message: "Payment completed successfully!",
  data: "<JSON string>"
}
```

`data` is a JSON **string**. After `JSON.parse` it contains `customer`, `order`, `cardHolder`,
`transaction` and `gaObj`. The most useful fields:

| Field                                                | Example                        |
| ---------------------------------------------------- | ------------------------------ |
| `order.invoiceNo`                                    | `INV17900010076BDF0E`          |
| `order.orderRef`                                     | `ORD-1790000952045-423`        |
| `order.metadata.cartId`                              | `CART20260921EQN1AJ1C`         |
| `order.paymentStatus`                                | `completed`                    |
| `transaction.trxid`                                  | `TXN1790001007EA7174`          |
| `transaction.totalAmount`                            | `129.99`                       |
| `transaction.paymentMessage`                         | `Transaction Approved`         |
| `transaction.paymentMethod`, `transaction.account`   | `Mastercard`, `●●●● 5454`      |
| `customer.name`, `customer.email`                    | `James Dev`, `james@example.com` |

Handler:

```js
const CHECKOUT_ORIGIN = "https://merchant.fastauth.net";

window.addEventListener("message", (event) => {
  if (event.origin !== CHECKOUT_ORIGIN) return; // ignore messages from anyone else
  if (event.data?.status !== "success") return;

  const result = JSON.parse(event.data.data);
  closeCheckoutModal();
  emptyCart();
  showConfirmation(result.order.invoiceNo, result.transaction.trxid);
});
```

Always check `event.origin`. Any page or browser extension can post messages to your window.

Use this event for the customer-facing screen only. Before you ship goods or mark an order
as paid in your own system, confirm the payment server-side (FastAuth webhooks or the
transaction in your merchant dashboard). A message in the browser can be faked by the
person sitting at that browser.

## Step 4: Update a cart

If the customer closes the checkout, changes the cart and checks out again, update the
existing cart. Do not create a new one.

`POST {API base URL}/orders/carts/{cartId}/update`

Same headers and same payload shape as create, but **send only the objects that changed**.
Anything you leave out keeps its current value.

Customer changed quantities or items:

```json
{
  "cart": {
    "items": [
      {
        "name": "Wireless Headphones",
        "sku": "HDP-001",
        "image_url": "https://example.com/headphones.jpg",
        "product_ref": "p-headphones",
        "desc": "Over-ear, noise cancelling, 30h battery",
        "qty": 2,
        "unit_price": "129.99",
        "discount_type": "fixed",
        "discount_value": 0,
        "tax_type": "fixed",
        "tax_value": 0,
        "metadata": { "category": "Audio" }
      }
    ]
  }
}
```

`cart.items` replaces the whole item list, so send every item that should be in the cart,
each with all its required fields. The response has the same shape as create, with
recalculated totals and the same `cartId`.

What this project does ([`src/app/cart/page.tsx`](../src/app/cart/page.tsx)):

| Situation                                  | Action                                              |
| ------------------------------------------ | --------------------------------------------------- |
| First checkout                             | Create cart, remember `cartId` (localStorage)       |
| Cart changed since last checkout           | Update with `{ "cart": { "items": [...] } }`        |
| Nothing changed                            | Reopen the iframe, no API call                      |
| Update says the cart does not exist        | Create a new cart                                   |
| Payment succeeded                          | Forget `cartId`, the next order creates a new cart  |

## Errors

Error responses look like this:

```json
{ "status": false, "success": false, "statusCode": 422, "message": "The item name is required.", "errors": ["..."] }
```

| Status | Meaning                                                                                  |
| ------ | ---------------------------------------------------------------------------------------- |
| 401    | `API key is missing` or `Invalid or expired API key`.                                    |
| 403    | With a JSON body: `Invalid scopes`. With an HTML body: blocked by the firewall, see below. |
| 422    | Validation failed. `message` lists the problems, `details` has them per field.           |
| 400    | On update: the cart id does not exist (the API returns 400 here, not 404).               |
| 500    | Server error. `message` has the reason.                                                  |

## Calling the API from a server

Call the API from your backend when you can. It keeps prices under your control: this
project sends only product ids and quantities from the browser, and the server looks up the
prices ([`buildItems`](../src/lib/fastauth.ts)).

Known issue: the API sits behind Cloudflare, and Cloudflare may block requests from cloud
hosting IPs (Vercel, AWS and similar) with an HTML `403` page. This project handles it in
two ways:

1. The server request sends a browser-like `User-Agent`.
2. If the server request is still blocked, the server returns the prepared request and the
   browser sends it to the API directly ([`src/lib/cart-api.ts`](../src/lib/cart-api.ts)).
   The API allows CORS from any origin. Blocks are logged on the server as
   `[FastAuth] server request blocked` with the `cf-ray` id.

The permanent fix is a Cloudflare rule that lets API traffic through. Until that is in
place, server-to-server integrations on cloud hosting need the browser fallback.

## Project map

| File                                   | Purpose                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| `src/config/env.ts`                    | API URL, checkout URL, API key                           |
| `src/config/site.ts`                   | Company details used in header and footer                |
| `src/lib/products.ts`                  | Demo product catalog                                     |
| `src/lib/fastauth.ts`                  | Server side: builds cart items, calls the FastAuth API   |
| `src/lib/cart-api.ts`                  | Client side: calls our routes, browser fallback          |
| `src/lib/cart-context.tsx`             | Cart state, saved in localStorage, remembers `cartId`    |
| `src/app/api/cart/route.ts`            | Create cart                                              |
| `src/app/api/cart/[cartId]/route.ts`   | Update cart                                              |
| `src/app/cart/page.tsx`                | Cart page, create/update decision, success screen        |
| `src/components/CheckoutModal.tsx`     | Checkout iframe and payment event listener               |

## Run and deploy

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Vercel: import the repository, add the three environment variables above, deploy.

## Test checklist

- [ ] Add a product, press Checkout: the iframe opens with the right items and total.
- [ ] Close the iframe, change a quantity, press Checkout: same `cartId`, new total.
- [ ] Press Checkout again without changes: the iframe reopens and no request is sent.
- [ ] Complete a payment: the modal closes, the cart is empty, the confirmation shows invoice and transaction id.
- [ ] Start a new order after paying: a new `cartId` is created.
- [ ] Use a wrong API key: the cart page shows `Invalid or expired API key`.
