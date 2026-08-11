import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

export const certificateEventNames: Record<string, string> = {
  cad: "CAD Expert",
  mechamind: "Mechamind",
  management: "Management Maestro",
  truss: "Truss Combat",
  poster: "Poster Presentation",
};

export function formatCertificateEvents(events: string[]) {
  const names = [...new Set(events.filter(Boolean).map((event) => certificateEventNames[event] || event))];
  return names.length ? names.join(", ") : "Construct Carnival 2.0";
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
  const [brandLogo, seal, signature] = await Promise.all([
    readFile(join(process.cwd(), "public", "logo", "blue-main.svg")),
    readFile(join(process.cwd(), "public", "logo", "certificate_logo.png")),
    readFile(join(process.cwd(), "public", "images", "signature.png")),
  ]);
  const name = escapeXml(participant.name);
  const eventName = escapeXml(formatCertificateEvents(participant.events));
  const certificateId = escapeXml(createCertificateId(participant.name, participant.email));
  const logoUrl = asDataUrl(brandLogo, "image/svg+xml");
  const sealUrl = asDataUrl(seal, "image/png");
  const signatureUrl = asDataUrl(signature, "image/png");

  const svg = `
    <svg width="1600" height="1131" viewBox="0 0 1600 1131" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1131" fill="#fffdf7"/>
      <rect x="24" y="24" width="1552" height="1083" fill="none" stroke="#b58b3a" stroke-width="3"/>
      <rect x="36" y="36" width="1528" height="1059" fill="none" stroke="#d8c28f"/>
      <path d="M0 0H355L430 75 132 373 0 241Z" fill="#085041"/>
      <path d="M0 0H236L276 40 84 232 0 148" fill="none" stroke="#d8ad55" stroke-width="4"/>
      <path d="M1600 1131H1245L1170 1056 1468 758 1600 890Z" fill="#085041"/>
      <path d="M1600 1131H1364L1324 1091 1516 899 1600 983" fill="none" stroke="#d8ad55" stroke-width="4"/>

      <g font-family="Arial, sans-serif" fill="#52645f">
        <text x="1518" y="80" text-anchor="end" font-size="19">Certificate ID: ${certificateId}</text>
      </g>

      <g transform="translate(800 105)">
        <circle cx="-118" cy="0" r="54" fill="#fff" stroke="#d5ad5f" stroke-width="3"/>
        <image href="${logoUrl}" x="-158" y="-40" width="80" height="80" preserveAspectRatio="xMidYMid meet"/>
        <line x1="-48" y1="-48" x2="-48" y2="48" stroke="#d2be8d" stroke-width="2"/>
        <text x="-18" y="-6" font-family="Arial, sans-serif" font-size="23" font-weight="800" letter-spacing="5" fill="#085041">CONSTRUCT</text>
        <text x="-18" y="26" font-family="Arial, sans-serif" font-size="23" font-weight="800" letter-spacing="4" fill="#bd7e20">CARNIVAL 2.0</text>
      </g>

      <g text-anchor="middle">
        <text x="800" y="225" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="12" fill="#b58228">CERTIFICATE OF</text>
        <text x="800" y="320" font-family="Georgia, serif" font-size="98" font-weight="700" fill="#113f35">Participation</text>
        <text x="800" y="390" font-family="Georgia, serif" font-size="29" font-style="italic" fill="#66716e">This certificate is proudly presented to</text>
        <text x="800" y="485" font-family="URW Chancery L, Segoe Script, cursive" font-size="76" fill="#172e29">${name}</text>
        <line x1="390" y1="510" x2="1210" y2="510" stroke="#c9a457" stroke-width="2"/>
        <text x="800" y="570" font-family="Arial, sans-serif" font-size="24" fill="#52615e">in recognition of their enthusiastic participation in <tspan font-weight="700" fill="#174f42">${eventName}</tspan>, organized by the</text>
        <text x="800" y="610" font-family="Arial, sans-serif" font-size="24" fill="#52615e">Department of Building Engineering &amp; Construction Management at Rajshahi University of Engineering &amp; Technology.</text>
      </g>

      <g text-anchor="middle" font-family="Arial, sans-serif">
        <image href="${signatureUrl}" x="300" y="790" width="230" height="105" preserveAspectRatio="xMidYMid meet"/>
        <line x1="275" y1="888" x2="555" y2="888" stroke="#c29339" stroke-width="2"/>
        <text x="415" y="925" font-size="22" font-weight="800" letter-spacing="2" fill="#173e36">EVENT COORDINATOR</text>
        <text x="415" y="956" font-size="19" fill="#52645f">Construct Carnival 2.0</text>

        <image href="${sealUrl}" x="710" y="790" width="180" height="180" preserveAspectRatio="xMidYMid meet"/>

        <g transform="translate(1600 0) scale(-1 1)">
          <image href="${signatureUrl}" x="300" y="790" width="230" height="105" preserveAspectRatio="xMidYMid meet"/>
        </g>
        <line x1="1045" y1="888" x2="1325" y2="888" stroke="#c29339" stroke-width="2"/>
        <text x="1185" y="925" font-size="22" font-weight="800" letter-spacing="2" fill="#173e36">HEAD</text>
        <text x="1185" y="956" font-size="19" fill="#52645f">Dept. of BECM, RUET</text>
      </g>
    </svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
