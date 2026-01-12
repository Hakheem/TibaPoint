import fs from "fs";
import path from "path";
import pngToIco from "png-to-ico";

const logoPath = path.resolve(process.cwd(), "public", "logo.png");
const outPath = path.resolve(process.cwd(), "public", "favicon.ico");

async function generate() {
  try {
    if (!fs.existsSync(logoPath)) {
      console.error(
        "logo.png not found in public/. Please add the logo at public/logo.png"
      );
      process.exit(1);
    }

    const buf = await pngToIco(logoPath);
    fs.writeFileSync(outPath, buf);
    console.log("Generated", outPath);
  } catch (err) {
    console.error("Failed to generate favicon.ico:", err);
    process.exit(1);
  }
}

generate();
