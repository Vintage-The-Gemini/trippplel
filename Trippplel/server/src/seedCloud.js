require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const connectDB = require("./config/db");
const fs = require("fs");
const path = require("path");

const urlsPath = path.join(__dirname, "cloudinaryUrls.json");
if (!fs.existsSync(urlsPath)) {
  console.error("cloudinaryUrls.json not found. Run: npm run upload first.");
  process.exit(1);
}
const URLS = JSON.parse(fs.readFileSync(urlsPath, "utf8"));

const get = (slug) => URLS[slug] || `/images/products/${slug}.jpg`;

const products = [
  {
    name: "I Don't Make Mistakes",
    slug: "i-dont-make-mistakes",
    description: "I Don't Make Mistakes. I Date Them. Classic funny quote tee. Soft cotton, relaxed fit.",
    price: 1500,
    images: [get("i-dont-make-mistakes")],
    category: "tshirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 50, isNew: true, isFeatured: true,
  },
  {
    name: "Face Graphic Tee",
    slug: "face-graphic-tee",
    description: "Minimalist abstract face graphic. Bold black print on crisp white cotton.",
    price: 1500,
    images: [get("face-graphic-tee")],
    category: "tshirt",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "White", hex: "#FFFFFF" }],
    stock: 40, isNew: true, isFeatured: true,
  },
  {
    name: "Hakuna Ma'Vodka",
    slug: "hakuna-mavodka",
    description: "Hakuna Ma'Vodka — It Means No Memories For The Rest Of Your Night.",
    price: 1500,
    images: [get("hakuna-mavodka")],
    category: "tshirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Charcoal", hex: "#4a4a4a" }],
    stock: 35, isNew: false, isFeatured: true,
  },
  {
    name: "My Worst Nightmare",
    slug: "my-worst-nightmare",
    description: "No WiFi. Dead battery. Loading screen. The tee that speaks to your soul.",
    price: 1500,
    images: [get("my-worst-nightmare")],
    category: "tshirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 45, isNew: false, isFeatured: true,
  },
  {
    name: "Great In Bed",
    slug: "great-in-bed",
    description: "I'm Great In Bed — I Can Sleep For Days! Comfort meets humour.",
    price: 1500,
    images: [get("great-in-bed")],
    category: "tshirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 50, isNew: true, isFeatured: false,
  },
  {
    name: "Holding A Beer",
    slug: "holding-a-beer",
    description: "I'm Holding A Beer So Yeah, I'm Busy. The only valid excuse.",
    price: 1500,
    images: [get("holding-a-beer")],
    category: "tshirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 30, isNew: false, isFeatured: false,
  },
  {
    name: "It Is What It Is",
    slug: "it-is-what-it-is",
    description: "It Is What It Is — with a smiley. The vibe check tee.",
    price: 1500,
    images: [get("it-is-what-it-is")],
    category: "tshirt",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 60, isNew: true, isFeatured: false,
  },
  {
    name: "Beer O'Clock",
    slug: "beer-oclock",
    description: "BE:ER O'CLOCK. Digital clock style graphic. It's always beer o'clock somewhere.",
    price: 1500,
    images: [get("beer-oclock")],
    category: "tshirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 25, isNew: false, isFeatured: false,
  },
  {
    name: "Gamer Heartbeat",
    slug: "gamer-heartbeat",
    description: "Controller heartbeat graphic. For those whose heart beats for gaming.",
    price: 1500,
    images: [get("gamer-heartbeat")],
    category: "tshirt",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "White", hex: "#FFFFFF" }],
    stock: 40, isNew: true, isFeatured: false,
  },
  {
    name: "I'm Short",
    slug: "im-short",
    description: "If You Think I'm Short, You Should See My Patience.",
    price: 1500,
    images: [get("im-short")],
    category: "tshirt",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 35, isNew: false, isFeatured: false,
  },
  {
    name: "Are You Drunk?",
    slug: "are-you-drunk",
    description: "Are You Drunk? Yes / No — with a big red X. The conversation starter tee.",
    price: 1500,
    images: [get("are-you-drunk")],
    category: "tshirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 30, isNew: false, isFeatured: false,
  },
  {
    name: "Forget The Dogs",
    slug: "forget-the-dogs",
    description: "Forget The Dogs — Who Let The Idiots Out? The boldest statement tee.",
    price: 1500,
    images: [get("forget-the-dogs")],
    category: "tshirt",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 20, isNew: true, isFeatured: false,
  },
  {
    name: "Trusting God Hoodie",
    slug: "trusting-god-hoodie",
    description: "I'm Just Out Here Trusting God. Faith-inspired premium hoodie.",
    price: 3500,
    images: [get("trusting-god-hoodie")],
    category: "hoodie",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "White", hex: "#FFFFFF" }],
    stock: 25, isNew: true, isFeatured: true,
  },
  {
    name: "Pray Hoodie",
    slug: "pray-hoodie",
    description: "Pray On It. Pray Over It. Pray Through It. Bold faith hoodie.",
    price: 3500,
    images: [get("pray-hoodie")],
    category: "hoodie",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "White", hex: "#FFFFFF" }],
    stock: 20, isNew: true, isFeatured: true,
  },
  {
    name: "Can't Adult Today Hoodie",
    slug: "cant-adult-today-hoodie",
    description: "I Can't Adult Today. Relatable. Cozy. Honest. Premium heavyweight hoodie.",
    price: 3500,
    images: [get("cant-adult-today-hoodie")],
    category: "hoodie",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black", hex: "#000000" }],
    stock: 20, isNew: false, isFeatured: true,
  },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✓ Seeded ${products.length} products with Cloudinary URLs`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
