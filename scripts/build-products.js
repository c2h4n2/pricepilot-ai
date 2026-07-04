const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "..", "data", "products");
const outputFile = path.join(__dirname, "..", "data", "products.json");

function readJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir).flatMap((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) return readJsonFiles(fullPath);
    if (!item.endsWith(".json")) return [];

    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

const products = readJsonFiles(sourceDir).sort((a, b) => {
  return (
    String(a.type).localeCompare(String(b.type)) ||
    String(a.name).localeCompare(String(b.name))
  );
});

fs.writeFileSync(outputFile, JSON.stringify(products, null, 2) + "\n");

console.log(`Built ${products.length} products into data/products.json`);
