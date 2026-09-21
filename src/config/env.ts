// Server-side config (only imported from route handlers).
// Values can be overridden from Vercel > Project > Settings > Environment Variables.
export const env = {
  apiUrl: process.env.FASTAUTH_API_URL ?? "https://api.paymentlync.com/v2/api",
  checkoutUrl: process.env.FASTAUTH_CHECKOUT_URL ?? "https://merchant.fastauth.net/checkout",
  apiKey: process.env.FASTAUTH_API_KEY ?? "", // paste api key here
};
