export type Product = {
  id: string;
  sku: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  category: string;
};

export const products: Product[] = [
  {
    id: "p-headphones",
    sku: "HDP-001",
    name: "Wireless Headphones",
    desc: "Over-ear, noise cancelling, 30h battery",
    price: 129.99,
    image: "https://picsum.photos/seed/fa-headphones/600/600",
    category: "Audio",
  },
  {
    id: "p-watch",
    sku: "WTC-002",
    name: "Smart Watch",
    desc: "Heart rate, GPS and 7-day battery",
    price: 199.0,
    image: "https://picsum.photos/seed/fa-watch/600/600",
    category: "Wearables",
  },
  {
    id: "p-backpack",
    sku: "BPK-003",
    name: "Travel Backpack",
    desc: "Water resistant, fits 16\" laptop",
    price: 74.5,
    image: "https://picsum.photos/seed/fa-backpack/600/600",
    category: "Bags",
  },
  {
    id: "p-speaker",
    sku: "SPK-004",
    name: "Bluetooth Speaker",
    desc: "Portable, waterproof, deep bass",
    price: 59.99,
    image: "https://picsum.photos/seed/fa-speaker/600/600",
    category: "Audio",
  },
  {
    id: "p-keyboard",
    sku: "KBD-005",
    name: "Mechanical Keyboard",
    desc: "Hot-swappable switches, RGB backlight",
    price: 89.0,
    image: "https://picsum.photos/seed/fa-keyboard/600/600",
    category: "Accessories",
  },
  {
    id: "p-mouse",
    sku: "MSE-006",
    name: "Ergonomic Mouse",
    desc: "Vertical grip, silent clicks",
    price: 34.99,
    image: "https://picsum.photos/seed/fa-mouse/600/600",
    category: "Accessories",
  },
  {
    id: "p-lamp",
    sku: "LMP-007",
    name: "Desk Lamp",
    desc: "Dimmable LED with wireless charger",
    price: 45.0,
    image: "https://picsum.photos/seed/fa-lamp/600/600",
    category: "Home",
  },
  {
    id: "p-bottle",
    sku: "BTL-008",
    name: "Insulated Bottle",
    desc: "Keeps drinks cold for 24 hours",
    price: 24.99,
    image: "https://picsum.photos/seed/fa-bottle/600/600",
    category: "Home",
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
