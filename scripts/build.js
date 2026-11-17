const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");

async function build() {
  await fs.mkdir(output, { recursive: true });
  await fs.copyFile(path.join(root, "index.html"), path.join(output, "index.html"));
  await fs.cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
}

build().catch(function (error) {
  console.error("Site build failed:", error.message);
  process.exitCode = 1;
});
