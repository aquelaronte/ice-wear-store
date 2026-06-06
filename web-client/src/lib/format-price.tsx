export type VariantGroup = {
  name: string;
  options: string[];
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  details: string[];
  images: string[];
  variants: VariantGroup[];
};

export const products: Product[] = [
  {
    slug: "glacier-parka",
    name: "Glacier Parka",
    price: 389,
    category: "Outerwear",
    description:
      "Our flagship expedition parka built to hold heat at the edge of the world. A windproof shell, faux-fur hood, and down-alternative fill keep the cold exactly where it belongs — outside.",
    details: [
      "Windproof, water-repellent outer shell",
      "650-fill down-alternative insulation",
      "Removable faux-fur hood trim",
      "Four exterior pockets, two fleece-lined",
    ],
    images: ["/products/glacier-parka-1.png", "/products/glacier-parka-2.png"],
    variants: [
      { name: "Size", options: ["XS", "S", "M", "L", "XL"] },
      { name: "Color", options: ["Ice Blue", "Slate", "Snow White"] },
    ],
  },
  {
    slug: "frost-hoodie",
    name: "Frost Hoodie",
    price: 128,
    category: "Knitwear",
    description:
      "A heavyweight everyday hoodie in brushed fleece. Oversized cut, dropped shoulders, and a double-lined hood for the days when the chill creeps in early.",
    details: [
      "480gsm brushed cotton fleece",
      "Oversized relaxed fit",
      "Double-layer hood with flat drawcords",
      "Ribbed cuffs and hem",
    ],
    images: ["/products/frost-hoodie-1.png", "/products/frost-hoodie-2.png"],
    variants: [
      { name: "Size", options: ["XS", "S", "M", "L", "XL"] },
      { name: "Color", options: ["Frost White", "Glacier Grey"] },
    ],
  },
  {
    slug: "arctic-beanie",
    name: "Arctic Beanie",
    price: 46,
    category: "Accessories",
    description:
      "A chunky rib-knit beanie spun from a merino blend. Soft, warm, and cut with a foldable cuff that sits just right.",
    details: [
      "Merino wool blend",
      "Chunky 5-gauge rib knit",
      "Foldable double-layer cuff",
      "One size, true stretch fit",
    ],
    images: ["/products/arctic-beanie-1.png", "/products/arctic-beanie-2.png"],
    variants: [
      { name: "Color", options: ["Ice Blue", "Snow White", "Charcoal"] },
    ],
  },
  {
    slug: "tundra-puffer-vest",
    name: "Tundra Puffer Vest",
    price: 174,
    category: "Outerwear",
    description:
      "A quilted puffer vest that layers over anything. Core warmth without the bulk, finished in a matte slate shell.",
    details: [
      "Matte recycled nylon shell",
      "Quilted box-baffle construction",
      "Two zip hand pockets",
      "Packs into its own pocket",
    ],
    images: ["/products/tundra-puffer-1.png", "/products/tundra-puffer-2.png"],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL"] },
      { name: "Color", options: ["Slate Navy", "Ice Blue"] },
    ],
  },
  {
    slug: "snowfall-scarf",
    name: "Snowfall Scarf",
    price: 58,
    category: "Accessories",
    description:
      "An extra-long wool scarf with a soft hand and a relaxed fringe. Wrap it twice and forget the wind.",
    details: [
      "Lambswool blend",
      "200cm extra-long length",
      "Hand-finished fringe",
      "Brushed soft face",
    ],
    images: [
      "/products/snowfall-scarf-1.png",
      "/products/snowfall-scarf-2.png",
    ],
    variants: [{ name: "Color", options: ["Frost Grey", "Ice Blue", "Cream"] }],
  },
  {
    slug: "polar-gloves",
    name: "Polar Gloves",
    price: 64,
    category: "Accessories",
    description:
      "Insulated touchscreen gloves that keep dexterity intact. Grippy palms, fleece lining, and a snug knit cuff.",
    details: [
      "Touchscreen-compatible fingertips",
      "Micro-fleece lining",
      "Silicone grip palm",
      "Elasticated knit cuff",
    ],
    images: ["/products/polar-gloves-1.png", "/products/polar-gloves-2.png"],
    variants: [
      { name: "Size", options: ["S/M", "L/XL"] },
      { name: "Color", options: ["Ice Blue", "Black"] },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

const priceFormatter = Intl.NumberFormat("es-CO");

export function formatPrice(price: number) {
  return `$1${priceFormatter.format(price / 100)}`;
}
