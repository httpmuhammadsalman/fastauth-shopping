import type { Metadata } from "next";
import CodeBlock from "@/components/docs/CodeBlock";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Developer Docs",
  description: "Integrate FastAuth checkout: create a cart, open the checkout iframe, handle the payment event.",
};

const API_URL = "https://api.paymentlync.com/v2/api";
const CHECKOUT_URL = "https://merchant.fastauth.net/checkout";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "configuration", title: "Configuration" },
  { id: "create-cart", title: "1. Create a cart" },
  { id: "checkout", title: "2. Open the checkout" },
  { id: "payment-event", title: "3. Payment result" },
  { id: "update-cart", title: "4. Update a cart" },
  { id: "errors", title: "Errors" },
  { id: "server-calls", title: "Calling from a server" },
  { id: "checklist", title: "Test checklist" },
];

const headersCode = `Content-Type: application/json
Accept: application/json
X-API-KEY: <your api key>`;

const createPayload = `{
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
}`;

const createResponse = `{
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
        "items": [
          { "id": "PROD20260908GOZRYTEM", "name": "Wireless Headphones", "qty": 1, "finalPrice": 129.99 }
        ],
        "subTotal": 129.99,
        "discountAmount": 0,
        "taxAmount": 0,
        "shippingCost": 0,
        "netTotal": 129.99
      }
    }
  }
}`;

const createExample = `const res = await fetch("${API_URL}/orders/carts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-KEY": process.env.FASTAUTH_API_KEY,
  },
  body: JSON.stringify(payload),
});

const json = await res.json();
const cartId = json.results.data.cartId;`;

const iframeCode = `<iframe
  src="${CHECKOUT_URL}?cart_id=CART20260921DCA9ZKWP&apiKey=YOUR_API_KEY"
  title="FastAuth Checkout"
  allow="payment"
  style="width: 100%; height: 100%; border: 0"
></iframe>`;

const eventShape = `{
  status: "success",
  message: "Payment completed successfully!",
  data: "<JSON string>" // JSON.parse() it: customer, order, cardHolder, transaction, gaObj
}`;

const eventHandler = `const CHECKOUT_ORIGIN = "https://merchant.fastauth.net";

window.addEventListener("message", (event) => {
  if (event.origin !== CHECKOUT_ORIGIN) return; // ignore messages from anyone else
  if (event.data?.status !== "success") return;

  const result = JSON.parse(event.data.data);

  closeCheckoutModal();
  emptyCart();
  showConfirmation(result.order.invoiceNo, result.transaction.trxid);
});`;

const updatePayload = `{
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
}`;

const errorShape = `{
  "status": false,
  "success": false,
  "statusCode": 422,
  "message": "The item name is required.",
  "errors": ["The item name is required."]
}`;

const itemFields = [
  ["order_ref", "Your own order reference. Generate a unique one per order."],
  ["currency", "3-letter code, e.g. USD."],
  ["cart.items[].name", "Required, max 120 characters."],
  ["cart.items[].sku", "Required, max 50 characters."],
  ["cart.items[].product_ref", "Required, max 50 characters. Your product id."],
  ["cart.items[].image_url", "Optional, max 255 characters. Shown on the checkout page."],
  ["cart.items[].desc", "Optional, max 255 characters."],
  ["cart.items[].qty", "Required, integer, minimum 1."],
  ["cart.items[].unit_price", "Required, number, minimum 0.001."],
  ["cart.items[].discount_type, tax_type", "Optional, fixed or percentage."],
  ["cart.items[].discount_value, tax_value", "Optional, number, minimum 0."],
  ["cart.items[].metadata", "Optional object. Returned to you unchanged."],
  ["cart.discounts[]", "Optional. Each needs code, type (fixed / percentage), value, description."],
  ["cart.fees[]", "Optional. Each needs type (fixed / percentage), value, description."],
  ["cart.add_ons[]", "Optional. Same shape as cart.items[]."],
  ["cart.discount_amount, cart.tax_amount", "Optional cart-level amounts, minimum 0."],
];

const eventFields = [
  ["order.invoiceNo", "INV17900010076BDF0E"],
  ["order.orderRef", "ORD-1790000952045-423"],
  ["order.metadata.cartId", "CART20260921EQN1AJ1C"],
  ["order.paymentStatus", "completed"],
  ["transaction.trxid", "TXN1790001007EA7174"],
  ["transaction.totalAmount", "129.99"],
  ["transaction.paymentMessage", "Transaction Approved"],
  ["transaction.paymentMethod", "Mastercard"],
  ["transaction.account", "●●●● 5454"],
  ["customer.name, customer.email", "James Dev, james@example.com"],
];

const updateCases = [
  ["First checkout", "Create the cart and remember cartId."],
  ["Cart changed since the last checkout", "Update with { cart: { items: [...] } }."],
  ["Nothing changed", "Reopen the iframe, no API call."],
  ["Update says the cart does not exist", "Create a new cart."],
  ["Payment succeeded", "Forget cartId. The next order creates a new cart."],
];

const errors = [
  ["401", "API key is missing, or Invalid or expired API key."],
  ["403", "With a JSON body: Invalid scopes. With an HTML body: blocked by the firewall, see Calling from a server."],
  ["422", "Validation failed. message lists the problems, details has them per field."],
  ["400", "On update: the cart id does not exist. The API returns 400 here, not 404."],
  ["500", "Server error. message has the reason."],
];

const checklist = [
  "Add a product and press Checkout: the iframe opens with the right items and total.",
  "Close the iframe, change a quantity, press Checkout: same cartId, new total.",
  "Press Checkout again without changes: the iframe reopens and no request is sent.",
  "Complete a payment: the modal closes, the cart is empty, the confirmation shows invoice and transaction id.",
  "Start a new order after paying: a new cartId is created.",
  "Use a wrong API key: you get Invalid or expired API key.",
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-zinc-200 py-10 first:pt-0 last:border-0">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">{title}</h2>
      <div className="space-y-4 leading-relaxed text-zinc-700">{children}</div>
    </section>
  );
}

function Endpoint({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-sm">
      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{method}</span>
      <span className="break-all text-zinc-900">{path}</span>
    </div>
  );
}

function Table({ head, rows }: { head: [string, string]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-semibold">{head[0]}</th>
            <th className="px-4 py-3 font-semibold">{head[1]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map(([key, value]) => (
            <tr key={key}>
              <td className="px-4 py-3 align-top font-mono text-[13px] text-zinc-900">{key}</td>
              <td className="px-4 py-3 text-zinc-600">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {children}
    </div>
  );
}

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[13px] text-zinc-900">{children}</code>
);

export default function DocsPage() {
  return (
    <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav className="sticky top-24 space-y-1 text-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">On this page</p>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      <article className="min-w-0">
        <header className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Developer Docs</span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">{site.name} Checkout Integration</h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-500">
            Create a cart with one API call, open the hosted checkout in an iframe, and listen for the
            payment result. This store is a working example of everything on this page.
          </p>
        </header>

        <Section id="overview" title="Overview">
          <ol className="space-y-3">
            {[
              ["Create a cart", "Send the order items to the API. You get a cartId back."],
              ["Open the checkout", "Load the hosted checkout in an iframe with the cartId and your API key."],
              ["Update the cart", "If the customer changes the cart before paying, update the same cart."],
              ["Handle the result", "The checkout posts a message to your page when the payment completes."],
            ].map(([title, text], index) => (
              <li key={title} className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-zinc-900">{title}</p>
                  <p className="text-sm text-zinc-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p>
            Your store never touches card data. The customer enters address and payment details inside the{" "}
            {site.name} iframe.
          </p>
        </Section>

        <Section id="configuration" title="Configuration">
          <Table
            head={["Setting", "Value"]}
            rows={[
              ["API base URL", API_URL],
              ["Checkout URL", CHECKOUT_URL],
              ["Auth header", "X-API-KEY: <your api key>"],
            ]}
          />
          <p>API keys are created in the {site.name} merchant dashboard. Send these headers with every request:</p>
          <CodeBlock label="Headers" code={headersCode} />
        </Section>

        <Section id="create-cart" title="1. Create a cart">
          <Endpoint method="POST" path={`${API_URL}/orders/carts`} />
          <CodeBlock label="Request body" code={createPayload} />
          <Table head={["Field", "Rules"]} rows={itemFields} />
          <p>
            Products are saved to your {site.name} catalog automatically, matched on <Mono>sku</Mono>,{" "}
            <Mono>name</Mono> and <Mono>product_ref</Mono>.
          </p>
          <CodeBlock label="Response (keys come back in camelCase)" code={createResponse} />
          <p>
            Keep <Mono>results.data.cartId</Mono>. You need it for the checkout URL and for updates. A cart
            expires 7 days after it was last created or updated.
          </p>
          <CodeBlock label="Example (Node.js)" code={createExample} />
        </Section>

        <Section id="checkout" title="2. Open the checkout">
          <p>Build the checkout URL from the cart id and your API key, then load it in an iframe:</p>
          <CodeBlock label="HTML" code={iframeCode} />
          <p>Show the iframe in a full-height modal so the customer stays on your site.</p>
        </Section>

        <Section id="payment-event" title="3. Payment result">
          <p>
            When the payment completes, the checkout page sends a <Mono>postMessage</Mono> to the parent
            window:
          </p>
          <CodeBlock label="event.data" code={eventShape} />
          <p>
            <Mono>data</Mono> is a JSON <strong>string</strong>. After <Mono>JSON.parse</Mono> the most useful
            fields are:
          </p>
          <Table head={["Field", "Example"]} rows={eventFields} />
          <CodeBlock label="Handler" code={eventHandler} />
          <Note>
            <strong>Always check event.origin.</strong> Any page or browser extension can post messages to
            your window. Use this event for the customer-facing screen only. Before you ship goods or mark an
            order as paid in your own system, confirm the payment server-side with {site.name} webhooks or the
            transaction in your merchant dashboard.
          </Note>
        </Section>

        <Section id="update-cart" title="4. Update a cart">
          <p>
            If the customer closes the checkout, changes the cart and checks out again, update the existing
            cart. Do not create a new one.
          </p>
          <Endpoint method="POST" path={`${API_URL}/orders/carts/{cartId}/update`} />
          <p>
            Same headers and same payload shape as create, but <strong>send only the objects that changed</strong>.
            Anything you leave out keeps its current value.
          </p>
          <CodeBlock label="Request body: quantities or items changed" code={updatePayload} />
          <p>
            <Mono>cart.items</Mono> replaces the whole item list, so send every item that should be in the
            cart, each with all its required fields. The response has the same shape as create, with
            recalculated totals and the same <Mono>cartId</Mono>.
          </p>
          <Table head={["Situation", "What to do"]} rows={updateCases} />
        </Section>

        <Section id="errors" title="Errors">
          <CodeBlock label="Error response" code={errorShape} />
          <Table head={["Status", "Meaning"]} rows={errors} />
        </Section>

        <Section id="server-calls" title="Calling from a server">
          <p>
            Call the API from your backend when you can. It keeps prices under your control: send only product
            ids and quantities from the browser and look the prices up on your server.
          </p>
          <Note>
            <strong>Known issue.</strong> The API sits behind Cloudflare, which may block requests from cloud
            hosting IPs (Vercel, AWS and similar) with an HTML <Mono>403</Mono> page. Send a browser-like{" "}
            <Mono>User-Agent</Mono> header. If the request is still blocked, send it from the customer&apos;s
            browser instead. The API allows CORS from any origin.
          </Note>
        </Section>

        <Section id="checklist" title="Test checklist">
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                  &#10003;
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="pt-4">
            Need help? Email{" "}
            <a href={`mailto:${site.email}`} className="font-medium text-indigo-600 hover:underline">
              {site.email}
            </a>{" "}
            ({site.hours}).
          </p>
        </Section>
      </article>
    </div>
  );
}
