export type Product = {
  id: string;
  sku: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  category: string;
};

// Free-to-use photos from Unsplash (https://unsplash.com/license)
const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=600&h=600&fit=crop&auto=format&q=80`;

export const products: Product[] = [
  {
    id: "p-headphones",
    sku: "HDP-001",
    name: "Wireless Headphones",
    desc: "Over-ear, noise cancelling, 30h battery",
    price: 129.99,
    image: unsplash("photo-1505740420928-5e560c06d30e"),
    category: "Audio",
  },
  {
    id: "p-watch",
    sku: "WTC-002",
    name: "Smart Watch",
    desc: "Heart rate, GPS and 7-day battery",
    price: 199.0,
    image: unsplash("photo-1523275335684-37898b6baf30"),
    category: "Wearables",
  },
  {
    id: "p-backpack",
    sku: "BPK-003",
    name: "Travel Backpack",
    desc: "Water resistant, fits 16\" laptop",
    price: 74.5,
    image: unsplash("photo-1553062407-98eeb64c6a62"),
    category: "Bags",
  },
  {
    id: "p-speaker",
    sku: "SPK-004",
    name: "Bluetooth Speaker",
    desc: "Portable, waterproof, deep bass",
    price: 59.99,
    image: unsplash("photo-1608043152269-423dbba4e7e1"),
    category: "Audio",
  },
  {
    id: "p-keyboard",
    sku: "KBD-005",
    name: "Wireless Keyboard",
    desc: "Slim aluminium body, full-size layout",
    price: 89.0,
    image: unsplash("photo-1587829741301-dc798b83add3"),
    category: "Accessories",
  },
  {
    id: "p-mouse",
    sku: "MSE-006",
    name: "Wireless Mouse",
    desc: "Compact design, silent clicks",
    price: 34.99,
    image: unsplash("photo-1527864550417-7fd91fc51a46"),
    category: "Accessories",
  },
  {
    id: "p-lamp",
    sku: "LMP-007",
    name: "Desk Lamp",
    desc: "Adjustable head, matte grey finish",
    price: 45.0,
    image: unsplash("photo-1507473885765-e6ed057f782c"),
    category: "Home",
  },
  {
    id: "p-bottle",
    sku: "BTL-008",
    name: "Insulated Bottle",
    desc: "Keeps drinks cold for 24 hours",
    price: 24.99,
    image: unsplash("photo-1602143407151-7111542de6e8"),
    category: "Home",
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
