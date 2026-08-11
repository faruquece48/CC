import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { formatParticipantName } from "@/lib/participantName";

export const certificateEventNames: Record<string, string> = {
  cad: "CAD Expert",
  mechamind: "Mechamind",
  management: "Management Maestro",
  truss: "Truss Combat",
  poster: "Poster Presentation",
};

export function formatCertificateEvents(_events: string[]) {
  return "Construct Carnival 2.0";
}

export function createCertificateId(name: string, email: string) {
  const source = `${name.trim().toLowerCase()}-${email.trim().toLowerCase()}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }
  return `CC2-P-${hash.toString(36).toUpperCase().padStart(7, "0").slice(-7)}`;
}

const escapeXml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const asDataUrl = (buffer: Buffer, mime: string) => `data:${mime};base64,${buffer.toString("base64")}`;

export async function createParticipationCertificateImage(participant: {
  name: string;
  email: string;
  events: string[];
}) {
  const [brandLogo, seal, coordinatorSignature, headSignature, certificateFont] = await Promise.all([
    readFile(join(process.cwd(), "public", "logo", "blue-main.svg")),
    readFile(join(process.cwd(), "public", "logo", "certificate_logo.png")),
    readFile(join(process.cwd(), "public", "images", "Signature_1.png")),
    readFile(join(process.cwd(), "public", "images", "signature.png")),
    readFile(join(process.cwd(), "node_modules", "next", "dist", "compiled", "@vercel", "og", "noto-sans-v27-latin-regular.ttf")),
  ]);
  const name = escapeXml(formatParticipantName(participant.name));
  const eventName = escapeXml(formatCertificateEvents(participant.events));
  const certificateId = escapeXml(createCertificateId(participant.name, participant.email));
  const logoUrl = asDataUrl(brandLogo, "image/svg+xml");
  const sealUrl = asDataUrl(seal, "image/png");
  const coordinatorSignatureUrl = asDataUrl(coordinatorSignature, "image/png");
  const headSignatureUrl = asDataUrl(headSignature, "image/png");
  const fontUrl = asDataUrl(certificateFont, "font/ttf");

  const svg = `
    <svg width="1600" height="1131" viewBox="0 0 1600 1131" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="securityGrid" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(7)">
          <path d="M0 0V20M10 0V20" stroke="#176f8f" stroke-width="0.6" opacity="0.1"/>
        </pattern>
      </defs>
      <style>
        @font-face {
          font-family: "Certificate Sans";
          src: url("${fontUrl}") format("truetype");
        }
        text { font-family: "Certificate Sans", sans-serif; }
      </style>
      <rect width="1600" height="1131" fill="#fffdf7"/>
      <rect x="24" y="24" width="1552" height="1083" fill="url(#securityGrid)"/>
      <rect x="24" y="24" width="1552" height="1083" fill="none" stroke="#176f8f" stroke-width="3"/>
      <rect x="44" y="44" width="1512" height="1043" fill="none" stroke="#176f8f" stroke-width="1.5"/>
      <g fill="none" stroke="#176f8f" stroke-width="3">
        <path d="M24 95V24H95M44 115V44H115M70 24V70H24"/>
        <path d="M1505 24H1576V95M1485 44H1556V115M1576 70H1530V24"/>
        <path d="M24 1036V1107H95M44 1016V1087H115M70 1107V1061H24"/>
        <path d="M1505 1107H1576V1036M1485 1087H1556V1016M1576 1061H1530V1107"/>
      </g>
      <g font-family="Certificate Sans, sans-serif" fill="#52645f">
        <g transform="translate(1145 81)" fill="none" stroke="#b58228" stroke-width="2">
          <circle cx="0" cy="0" r="7" fill="#fffdf7"/>
          <path d="M-4 6L-6 20 0 16 6 20 4 6"/>
        </g>
        <text x="1480" y="100" text-anchor="end" font-size="23" font-weight="400">Certificate ID: ${certificateId}</text>
      </g>

      <g transform="translate(800 125)">
        <circle cx="-118" cy="0" r="40" fill="#fff" stroke="#d5ad5f" stroke-width="3"/>
        <image href="${logoUrl}" x="-150" y="-32" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>
        <line x1="-48" y1="-40" x2="-48" y2="40" stroke="#d2be8d" stroke-width="2"/>
        <text x="-18" y="-6" font-family="Certificate Sans, sans-serif" font-size="23" font-weight="800" letter-spacing="5" fill="#07989c">CONSTRUCT</text>
        <text x="-18" y="26" font-family="Certificate Sans, sans-serif" font-size="23" font-weight="800" letter-spacing="4" fill="#f05a28">CARNIVAL <tspan fill="#9c3fe4">2.0</tspan></text>
      </g>

      <g text-anchor="middle" transform="translate(0 20)">
        <text x="800" y="225" font-size="24" font-weight="700" letter-spacing="12" fill="#b58228">CERTIFICATE OF</text>
        <text x="800" y="320" font-size="98" font-weight="700" fill="#113f35">Participation</text>
        <text x="800" y="428" font-size="29" font-style="italic" fill="#66716e">This certificate is proudly presented to</text>
        <text x="800" y="562" font-size="76" font-style="italic" word-spacing="18" fill="#172e29">${name}</text>
        <line x1="390" y1="587" x2="1210" y2="587" stroke="#c9a457" stroke-width="2"/>
        <text x="800" y="617" font-size="24" fill="#52615e">in recognition of their enthusiastic participation in <tspan font-weight="700" fill="#174f42">${eventName}</tspan>, organized by the</text>
        <text x="800" y="657" font-size="24" fill="#52615e">Department of Building Engineering &amp; Construction Management at Rajshahi University of Engineering &amp; Technology.</text>
      </g>

      <g text-anchor="middle" font-family="Certificate Sans, sans-serif">
        <image href="${coordinatorSignatureUrl}" x="285" y="866" width="230" height="105" preserveAspectRatio="xMidYMid meet"/>
        <line x1="260" y1="964" x2="540" y2="964" stroke="#c29339" stroke-width="2"/>
        <text x="400" y="1001" font-size="22" font-weight="800" letter-spacing="2" fill="#173e36">EVENT COORDINATOR</text>
        <text x="400" y="1032" font-size="19" fill="#52645f">Construct Carnival 2.0</text>

        <image href="${sealUrl}" x="710" y="866" width="180" height="180" preserveAspectRatio="xMidYMid meet"/>

        <image href="${headSignatureUrl}" x="1085" y="866" width="230" height="105" preserveAspectRatio="xMidYMid meet"/>
        <line x1="1060" y1="964" x2="1340" y2="964" stroke="#c29339" stroke-width="2"/>
        <text x="1200" y="1001" font-size="22" font-weight="800" letter-spacing="2" fill="#173e36">HEAD</text>
        <text x="1200" y="1032" font-size="19" fill="#52645f">Dept. of BECM, RUET</text>
      </g>
    </svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
