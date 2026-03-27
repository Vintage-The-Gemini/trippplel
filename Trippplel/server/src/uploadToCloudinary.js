require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Map filename → product slug
const IMAGE_MAP = {
  "tee-i-dont-make-mistakes.jpg":  "i-dont-make-mistakes",
  "tee-face-graphic.jpg":          "face-graphic-tee",
  "tee-hakuna-mavodka.jpg":        "hakuna-mavodka",
  "tee-my-worst-nightmare.jpg":    "my-worst-nightmare",
  "tee-great-in-bed.jpg":          "great-in-bed",
  "tee-holding-a-beer.jpg":        "holding-a-beer",
  "tee-it-is-what-it-is.jpg":      "it-is-what-it-is",
  "tee-beer-oclock.jpg":           "beer-oclock",
  "tee-gamer-heartbeat.jpg":       "gamer-heartbeat",
  "tee-im-short.jpg":              "im-short",
  "tee-are-you-drunk.jpg":         "are-you-drunk",
  "tee-forget-the-dogs.jpg":       "forget-the-dogs",
  "hoodie-trusting-god.jpg":       "trusting-god-hoodie",
  "hoodie-pray.jpg":               "pray-hoodie",
  "hoodie-cant-adult.jpg":         "cant-adult-today-hoodie",
};

// Path to images folder (relative to server root)
const IMAGES_DIR = path.join(__dirname, "../../client/public/images/products");

async function uploadAll() {
  console.log("Uploading images to Cloudinary...\n");
  const results = {};

  for (const [filename, slug] of Object.entries(IMAGE_MAP)) {
    const filePath = path.join(IMAGES_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ File not found: ${filename}`);
      continue;
    }
    try {
      const res = await cloudinary.uploader.upload(filePath, {
        folder: "trippplel/products",
        public_id: slug,
        overwrite: true,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      results[slug] = res.secure_url;
      console.log(`✓ ${filename} → ${res.secure_url}`);
    } catch (err) {
      console.error(`✗ ${filename}: ${err.message}`);
    }
  }

  // Save results to a JSON file so seed.js can use them
  const outputPath = path.join(__dirname, "cloudinaryUrls.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Saved URLs to src/cloudinaryUrls.json`);
  console.log("Now run: npm run seed:cloud");
}

uploadAll();
