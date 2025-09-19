const version = process.argv[2];
const filePath = process.argv[3];

const fs = require("fs");
const path = require("path");

if (!version) {
  console.error("Please provide a version number as an argument.");
  process.exit(1);
}
if (!filePath) {
  console.error("Please provide the path to config.json as an argument.");
  process.exit(1);
}

const configPath = path.resolve(process.cwd(), filePath);
if (!fs.existsSync(configPath)) {
  console.error(`File not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
config.version = version;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`Updated version to ${version} in ${filePath} (${configPath})`);
