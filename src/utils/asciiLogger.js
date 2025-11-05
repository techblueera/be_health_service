import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "../../public/config.json");

let devInfo = null;

async function loadDevInfo() {
  if (devInfo) return devInfo;
  try {
    const configData = await readFile(configPath, "utf8");
    devInfo = JSON.parse(configData);
    return devInfo;
  } catch (error) {
    console.warn(`⚠️ Could not load developer info. Using defaults.`);
    return { name: "The Developer", github: "your-github", linkedIn: "your-linkedin", ascii: "🚀" };
  }
}

function getTerminalWidth() { return process.stdout.columns || 80; }

function scaleAsciiArt(asciiArt, targetWidth) {
  const lines = asciiArt.split('\n');
  if (lines.length === 0) return "";
  let originalWidth = Math.max(...lines.map(l => l.length));
  if (originalWidth <= targetWidth) return asciiArt;
  const scaleFactor = originalWidth / targetWidth;
  return lines.map(line => {
    if (line.length === 0) return "";
    let scaledLine = "";
    for (let i = 0; i < targetWidth; i++) {
      const originalIndex = Math.floor(i * scaleFactor);
      scaledLine += line[originalIndex] || " ";
    }
    return scaledLine;
  }).join('\n');
}

export async function asciiLogger() {
  const info = await loadDevInfo();
  const border = "=".repeat(60);
  const terminalWidth = getTerminalWidth();
  let targetAsciiWidth = terminalWidth - 4;
  if (targetAsciiWidth < 20) targetAsciiWidth = 20;
  const displayAscii = info.ascii ? scaleAsciiArt(info.ascii, targetAsciiWidth) : "";

  console.log(border);
  console.log(`👋 Howdy! I'm ${info.name}.`);
  console.log("   Your Friendly Neighbourhood Dev Environment! 🚀");
  console.log("\n   Check out my work:");
  console.log(`   GitHub    : https://github.com/${info.github}`);
  console.log(`   LinkedIn  : https://linkedin.com/in/${info.linkedIn}`);
  console.log("\n" + displayAscii);
  console.log(border);
}
