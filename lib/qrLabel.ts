import { readFileSync } from "node:fs";
import path from "node:path";

type Font = {
  unitsPerEm: number;
  layout(text: string): {
    glyphs: { path: { toSVG(): string } }[];
    positions: { xAdvance: number; xOffset: number; yOffset: number }[];
  };
};
const fontkit = require("fontkit") as { create(buffer: Buffer): Font };
const fonts = new Map<number, Font>();

function lettering(text: string, size: number, baseline: number, color: string, weight: number, spacing = 0) {
  let font = fonts.get(weight);
  if (!font) {
    font = fontkit.create(readFileSync(path.join(process.cwd(), "node_modules", "@fontsource", "inter", "files", `inter-latin-${weight}-normal.woff`)));
    fonts.set(weight, font);
  }
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  const width = run.positions.reduce((sum, position) => sum + position.xAdvance * scale, 0) + Math.max(0, run.glyphs.length - 1) * spacing;
  let x = (420 - width) / 2;
  return run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const svg = `<path fill="${color}" transform="translate(${x + position.xOffset * scale},${baseline - position.yOffset * scale}) scale(${scale},${-scale})" d="${glyph.path.toSVG()}"/>`;
    x += position.xAdvance * scale + spacing;
    return svg;
  }).join("");
}

// Render glyph outlines, not SVG text: production needs no installed system fonts.
export function ambassadorQrLabel(registrationId: number | string, purpose: "kit" | "lunch") {
  return Buffer.from(`<svg width="420" height="82" xmlns="http://www.w3.org/2000/svg"><rect width="420" height="82" rx="10" fill="#073f37"/>${lettering(purpose === "kit" ? "KIT COLLECTION" : "LUNCH COLLECTION", 13, 25, "#f5d77a", 700, 1.5)}${lettering(`Registration ${registrationId} | Campus Ambassador`, 16, 53, "#ffffff", 700)}${lettering("Construct Carnival 2.0", 10, 72, "#d1fae5", 400)}</svg>`);
}
