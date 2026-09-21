# FastAuth Shop

Demo storefront that shows how to integrate FastAuth checkout: product list, shopping cart,
cart creation through the FastAuth API and payment inside the FastAuth checkout iframe.

Built with Next.js (App Router), TypeScript and Tailwind CSS.

## Quick start

```bash
npm install
```

Create `.env.local`:

```
FASTAUTH_API_URL=https://api.paymentlync.com/v2/api
FASTAUTH_CHECKOUT_URL=https://merchant.fastauth.net/checkout
FASTAUTH_API_KEY=your_api_key
```

```bash
npm run dev
```

Open http://localhost:3000.

## Documentation

Developer guide with endpoints, payloads, the iframe payment event and cart updates:
[docs/INTEGRATION.md](docs/INTEGRATION.md). The same guide is published on the site at `/docs`
([src/app/docs/page.tsx](src/app/docs/page.tsx)), keep the two in sync.

## Deploy

Deploy on Vercel and add the same three variables under Project > Settings > Environment Variables.
