import PDFDocument from "pdfkit";
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { createCertificateId, formatCertificateEvents } from "@/lib/participationCertificate";
import { formatParticipantName } from "@/lib/participantName";

type CertificateParticipant = {
  name: string;
  email: string;
  events: string[];
};

export function createParticipationCertificatePdf(
  participant: CertificateParticipant,
  options: { protect?: boolean } = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const certificateId = createCertificateId(participant.name, participant.email);
    const events = formatCertificateEvents(participant.events);
    const participantName = formatParticipantName(participant.name);
    const document = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
      ...(options.protect === false ? {} : {
        ownerPassword: randomBytes(32).toString("hex"),
        permissions: {
          modifying: false,
          annotating: false,
          fillingForms: false,
          documentAssembly: false,
          copying: true,
          contentAccessibility: true,
          printing: "highResolution" as const,
        },
      }),
      info: {
        Title: `Certificate of Participation - ${participantName}`,
        Author: "Construct Carnival 2.0",
        Subject: `Certificate ID: ${certificateId}`,
      },
    });
    const chunks: Buffer[] = [];
    document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    const width = document.page.width;
    const height = document.page.height;
    const green = "#085041";
    const gold = "#c29339";
    const muted = "#52615e";
    const sealPath = join(process.cwd(), "public", "logo", "certificate_logo.png");
    const brandPath = join(process.cwd(), "public", "logo", "blue-main_x1024.png");
    const coordinatorSignaturePath = join(process.cwd(), "public", "images", "Signature_1.png");
    const headSignaturePath = join(process.cwd(), "public", "images", "signature.png");
    const fontPath = (...parts: string[]) => join(process.cwd(), "node_modules", "@fontsource", ...parts);
    document.registerFont("Certificate Inter", fontPath("inter", "files", "inter-latin-400-normal.woff"));
    document.registerFont("Certificate Inter Bold", fontPath("inter", "files", "inter-latin-700-normal.woff"));
    document.registerFont("Certificate Lora Bold", fontPath("lora", "files", "lora-latin-700-normal.woff"));
    document.registerFont("Certificate Lora Italic", fontPath("lora", "files", "lora-latin-400-italic.woff"));
    const edwardianFontPath = "C:\\Windows\\Fonts\\ITCEDSCR.TTF";
    document.registerFont(
      "Certificate Script",
      existsSync(edwardianFontPath)
        ? edwardianFontPath
        : fontPath("great-vibes", "files", "great-vibes-latin-400-normal.woff"),
    );

    const frameBlue = "#176f8f";
    document.rect(0, 0, width, height).fill("#fffdf7");
    const frameOuter = 16;
    const frameInner = 27;
    document.save().opacity(0.035).strokeColor(frameBlue).lineWidth(0.28);
    for (let x = frameOuter - 70; x <= width - frameOuter; x += 5.6) {
      document.moveTo(x, frameOuter).lineTo(x + 70, height - frameOuter).stroke();
    }
    document.restore();
    document.save().opacity(0.025).strokeColor(frameBlue).lineWidth(0.2);
    for (let x = frameOuter; x <= width - frameOuter; x += 16.8) {
      document.moveTo(x, frameOuter).lineTo(x, height - frameOuter).stroke();
    }
    for (let y = frameOuter; y <= height - frameOuter; y += 16.8) {
      document.moveTo(frameOuter, y).lineTo(width - frameOuter, y).stroke();
    }
    document.restore();
    document.rect(frameOuter, frameOuter, width - frameOuter * 2, height - frameOuter * 2).lineWidth(1.9).stroke(frameBlue);
    document.rect(frameInner, frameInner, width - frameInner * 2, height - frameInner * 2).lineWidth(0.9).stroke(frameBlue);

    const drawFrameCorner = () => {
      document.moveTo(16, 53).lineTo(16, 16).lineTo(53, 16)
        .moveTo(27, 64).lineTo(27, 27).lineTo(64, 27)
        .moveTo(40, 16).lineTo(40, 40).lineTo(16, 40)
        .lineWidth(1.9).stroke(frameBlue);
    };
    drawFrameCorner();
    document.save().translate(width, 0).scale(-1, 1); drawFrameCorner(); document.restore();
    document.save().translate(0, height).scale(1, -1); drawFrameCorner(); document.restore();
    document.save().translate(width, height).scale(-1, -1); drawFrameCorner(); document.restore();

    const certificateIdText = `Certificate ID: ${certificateId}`;
    document.font("Certificate Inter").fontSize(10);
    const certificateIdRight = width - 60;
    const certificateIdWidth = document.widthOfString(certificateIdText);
    const awardX = certificateIdRight - certificateIdWidth - 11;
    document.save().lineWidth(1).strokeColor("#b58228").fillColor("#fffdf7")
      .circle(awardX, 58, 3.2).fillAndStroke()
      .moveTo(awardX - 2, 61).lineTo(awardX - 2.8, 67).lineTo(awardX, 65.3)
      .lineTo(awardX + 2.8, 67).lineTo(awardX + 2, 61).stroke()
      .restore();
    document.font("Certificate Inter").fontSize(10).fillColor(muted)
      .text(certificateIdText, width - 250, 54, { width: 190, align: "right" });

    document.save().lineWidth(1.4).fillColor("#ffffff").strokeColor("#d5ad5f")
      .circle(width / 2 - 70, 76, 22).fillAndStroke()
      .restore();
    document.image(brandPath, width / 2 - 87, 59, { fit: [34, 34] });
    document.moveTo(width / 2 - 32, 54).lineTo(width / 2 - 32, 98).lineWidth(1).stroke("#d2be8d");
    document.font("Certificate Inter Bold").fontSize(12).fillColor("#07989c")
      .text("C O N S T R U C T", width / 2 - 22, 59, { width: 180, align: "left" });
    document.fillColor("#f05a28")
      .text("C A R N I V A L  ", width / 2 - 22, 77, { width: 180, align: "left", continued: true });
    document.fillColor("#9c3fe4").text("2 . 0");

    document.font("Certificate Inter Bold").fontSize(13).fillColor("#b58228")
      .text("C E R T I F I C A T E   O F", 170, 132, { width: width - 340, align: "center" });
    document.font("Certificate Lora Bold").fontSize(51).fillColor("#113f35")
      .text("Participation", 130, 159, { width: width - 260, align: "center" });
    document.font("Certificate Lora Italic").fontSize(16).fillColor("#66716e")
      .text("This certificate is proudly presented to", 150, 247, { width: width - 300, align: "center" });

    const nameSize = participantName.length > 28 ? 31 : participantName.length > 20 ? 37 : 44;
    const scriptSize = nameSize + 8;
    const initialSize = scriptSize * 1.2;
    const nameWords = participantName.split(/\s+/).filter(Boolean);
    const nameRuns = nameWords.map((word) => {
      document.font("Certificate Script").fontSize(initialSize);
      const initial = word.charAt(0).toUpperCase();
      const initialWidth = document.widthOfString(initial);
      document.fontSize(scriptSize);
      const remainder = word.slice(1).toLowerCase();
      return { initial, initialWidth, remainder, remainderWidth: document.widthOfString(remainder) };
    });
    const nameGap = 15;
    const renderedNameWidth = nameRuns.reduce(
      (total, run) => total + run.initialWidth + run.remainderWidth,
      Math.max(0, nameRuns.length - 1) * nameGap,
    );
    let nameX = width / 2 - renderedNameWidth / 2;
    nameRuns.forEach((run) => {
      document.font("Certificate Script").fontSize(initialSize).fillColor("#172e29")
        .text(run.initial, nameX, 289, { lineBreak: false });
      nameX += run.initialWidth;
      document.fontSize(scriptSize)
        .text(run.remainder, nameX, 298, { lineBreak: false });
      nameX += run.remainderWidth + nameGap;
    });
    document.moveTo(205, 361).lineTo(width - 205, 361).lineWidth(1.2).stroke(gold);

    const paragraphX = 105;
    const paragraphWidth = width - paragraphX * 2;
    document.font("Certificate Inter").fontSize(12.5).fillColor(muted)
      .text("in recognition of their enthusiastic participation in ", paragraphX, 373, {
        width: paragraphWidth,
        align: "justify",
        lineGap: 5,
        continued: true,
      });
    document.font("Certificate Inter Bold").fillColor(green)
      .text(events, { continued: true });
    document.font("Certificate Inter").fillColor(muted)
      .text(", organized by the Department of Building Engineering & Construction Management at Rajshahi University of Engineering & Technology.");

    const coordinatorCenterX = width / 4;
    document.image(coordinatorSignaturePath, coordinatorCenterX - 55, 474, { fit: [110, 40], align: "center" });
    document.moveTo(coordinatorCenterX - 67, 518).lineTo(coordinatorCenterX + 67, 518).lineWidth(1).stroke(gold);
    document.font("Certificate Inter Bold").fontSize(10).fillColor("#173e36")
      .text("EVENT COORDINATOR", coordinatorCenterX - 82, 527, { width: 164, align: "center" });
    document.font("Certificate Inter").fontSize(9).fillColor(muted)
      .text("Construct Carnival 2.0", coordinatorCenterX - 82, 543, { width: 164, align: "center" });

    document.image(sealPath, width / 2 - 42, 465, { fit: [84, 84] });

    const headCenterX = width * 3 / 4;
    document.image(headSignaturePath, headCenterX - 55, 466, { fit: [110, 50], align: "center" });
    document.moveTo(headCenterX - 67, 518).lineTo(headCenterX + 67, 518).lineWidth(1).stroke(gold);
    document.font("Certificate Inter Bold").fontSize(10).fillColor("#173e36")
      .text("HEAD", headCenterX - 82, 527, { width: 164, align: "center" });
    document.font("Certificate Inter").fontSize(9).fillColor(muted)
      .text("Dept. of BECM, RUET", headCenterX - 82, 543, { width: 164, align: "center" });

    document.end();
  });
}
