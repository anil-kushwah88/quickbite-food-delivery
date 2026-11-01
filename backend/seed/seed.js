import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import mongoose from "mongoose";
import Food from "../models/foodModel.js";
import { UPLOAD_DIR } from "../middleware/upload.js";
import foods from "./foods.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.join(__dirname, "images");

/**
 * Inserts the demo menu. Images are copied into /uploads with a "seed-" prefix.
 * @param {{ reset?: boolean }} options reset=true wipes the existing menu first
 */
export const seedFoods = async ({ reset = false } = {}) => {
  if (reset) await Food.deleteMany({});
  else if ((await Food.estimatedDocumentCount()) > 0) return 0;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const docs = [];
  for (const food of foods) {
    const target = `seed-${food.image}`;
    await fs.copyFile(path.join(IMAGE_DIR, food.image), path.join(UPLOAD_DIR, target));
    docs.push({ ...food, image: target });
  }
  await Food.insertMany(docs);
  return docs.length;
};

// CLI:  npm run seed   |   npm run seed:reset
const isCli = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isCli) {
  const { default: connectDB } = await import("../config/db.js");
  try {
    await connectDB();
    const count = await seedFoods({ reset: process.argv.includes("--reset") });
    console.log(count ? `Seeded ${count} dishes` : "Menu already has items – use `npm run seed:reset` to reseed");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
