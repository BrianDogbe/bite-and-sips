export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  discountPercent?: number;
  available?: boolean;
}

/** Fallback menu if the API is offline */
const products: Product[] = [
  {
    id: 1,
    name: "Chicken Shawarma",
    category: "shawarma",
    price: 50,
    description: "House sauce & veggies",
    image: "/images/chicken-shawarma.jpg",
    discountPercent: 0,
    available: true,
  },
];

export function effectivePrice(product: Product): number {
  const discount = Math.min(100, Math.max(0, product.discountPercent || 0));
  return Math.round(product.price * (1 - discount / 100) * 100) / 100;
}

export default products;
