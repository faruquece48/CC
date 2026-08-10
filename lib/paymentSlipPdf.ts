import PDFDocument from "pdfkit";
import { randomBytes } from "node:crypto";
import { join } from "node:path";

type IndividualRegistration = {
    name: string;
    email: string;
    events: string[];
};

type TeamRegistration = {
    event: string;
    teamname: string;
    members: Array<{ name?: string }>;
};

type PaymentSlipPdfData = {
    registrationId: string | number;
    participantName: string;
    email: string;
    phone: string;
    department: string;
    university: string;
    transactionId: string;
    amount: string | number;
    individual: IndividualRegistration[];
    teams: TeamRegistration[];
    qrCode: Buffer;
    formatEvent: (event: string) => string;
};

export function createPaymentSlipPdf(data: PaymentSlipPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const document = new PDFDocument({
            size: "A4",
            margins: { top: 42, right: 48, bottom: 48, left: 48 },
            ownerPassword: randomBytes(32).toString("hex"),
            permissions: {
                modifying: false,
                annotating: false,
                fillingForms: false,
                documentAssembly: false,
                copying: true,
                contentAccessibility: true,
                printing: "highResolution",
            },
            info: {
                Title: `Payment Slip - Registration ${data.registrationId}`,
                Author: "Construct Carnival 2.0",
                Subject: "Registration payment confirmation",
            },
        });
        const chunks: Buffer[] = [];
        const pageWidth = document.page.width;
        const contentWidth = pageWidth - 96;
        const left = 48;
        const right = pageWidth - 48;
        const bottomLimit = document.page.height - 48;

        document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        document.on("end", () => resolve(Buffer.concat(chunks)));
        document.on("error", reject);

        const logoPath = join(process.cwd(), "public", "logo", "blue-main_x1024.png");
        const signaturePath = join(process.cwd(), "public", "images", "signature.png");

        const drawCenteredColoredText = (
            parts: Array<{ text: string; color: string }>,
            centerX: number,
            textY: number,
            fontSize: number,
        ) => {
            document.font("Helvetica-Bold").fontSize(fontSize);
            const totalWidth = parts.reduce((width, part) => width + document.widthOfString(part.text), 0);
            let textX = centerX - totalWidth / 2;
            parts.forEach((part) => {
                const partWidth = document.widthOfString(part.text);
                document.fillColor(part.color).text(part.text, textX, textY, {
                    width: partWidth,
                    lineBreak: false,
                });
                textX += partWidth;
            });
        };

        document.image(logoPath, left, 42, { fit: [64, 64] });
        document.image(data.qrCode, right - 68, 40, { fit: [68, 68] });
        drawCenteredColoredText([
            { text: "Construct ", color: "#14532d" },
            { text: "Carnival ", color: "#ca8a04" },
            { text: "2.0", color: "#c65d13" },
        ], pageWidth / 2, 51, 22);
        const mottoParts = [
            { text: "Building Future, Managing Reality", color: "#111827" },
        ];
        drawCenteredColoredText(mottoParts, pageWidth / 2, 81, 11);
        document.moveTo(left, 122).lineTo(right, 122).lineWidth(1).strokeColor("#cbd5e1").stroke();

        document.font("Helvetica-Bold").fontSize(17).fillColor("#065f46")
            .text("PAYMENT CONFIRMATION", left, 143, { width: contentWidth, align: "center" });
        document.font("Helvetica").fontSize(10.5).fillColor("#374151")
            .text(`Issued to ${data.participantName}`, left, 170, { width: contentWidth, align: "center" });

        let y = 202;
        const details = [
            [["Registration ID", String(data.registrationId)], ["Payment Status", "Paid"]],
            [["Transaction ID", data.transactionId], ["Amount", `${Number(data.amount).toLocaleString()} BDT`]],
            [["Email", data.email], ["Phone", data.phone]],
            [["Department", data.department], ["University", data.university]],
        ];
        const detailColumnWidth = contentWidth / 2;
        details.forEach((row, rowIndex) => {
            row.forEach(([label, value], columnIndex) => {
                const x = left + columnIndex * detailColumnWidth;
                const cellY = y + rowIndex * 42;
                document.rect(x, cellY, detailColumnWidth, 42).fillAndStroke(
                    rowIndex % 2 === 0 ? "#f8fafc" : "#ffffff",
                    "#cbd5e1",
                );
                document.font("Helvetica-Bold").fontSize(8).fillColor("#64748b")
                    .text(label.toUpperCase(), x + 10, cellY + 8, { width: detailColumnWidth - 20 });
                document.font("Helvetica").fontSize(10.5).fillColor("#111827")
                    .text(value || "-", x + 10, cellY + 21, {
                        width: detailColumnWidth - 20,
                        height: 17,
                        ellipsis: true,
                    });
            });
        });
        y += details.length * 42 + 28;

        const addPage = () => {
            document.addPage();
            y = 48;
        };

        const ensureSpace = (height: number) => {
            if (y + height > bottomLimit) addPage();
        };

        const drawTable = (title: string, headers: string[], rows: string[][], widths: number[]) => {
            if (rows.length === 0) return;
            const drawHeading = () => {
                ensureSpace(58);
                document.font("Helvetica-Bold").fontSize(13).fillColor("#111827").text(title, left, y);
                y += 22;
                let x = left;
                headers.forEach((header, index) => {
                    document.rect(x, y, widths[index], 27).fillAndStroke("#e2e8f0", "#94a3b8");
                    document.font("Helvetica-Bold").fontSize(9).fillColor("#1f2937")
                        .text(header, x + 7, y + 9, { width: widths[index] - 14 });
                    x += widths[index];
                });
                y += 27;
            };

            drawHeading();
            rows.forEach((row) => {
                const textHeights = row.map((value, index) => document.font("Helvetica").fontSize(9.5)
                    .heightOfString(value || "-", { width: widths[index] - 14 }));
                const rowHeight = Math.max(32, Math.max(...textHeights) + 14);
                if (y + rowHeight > bottomLimit) {
                    addPage();
                    drawHeading();
                }
                let x = left;
                row.forEach((value, index) => {
                    document.rect(x, y, widths[index], rowHeight).strokeColor("#cbd5e1").stroke();
                    document.font("Helvetica").fontSize(9.5).fillColor("#1f2937").text(value || "-", x + 7, y + 7, {
                        width: widths[index] - 14,
                        height: rowHeight - 14,
                    });
                    x += widths[index];
                });
                y += rowHeight;
            });
            y += 26;
        };

        drawTable(
            "Individual Event Registration",
            ["Participant", "Events", "Email"],
            data.individual.map((item) => [
                item.name,
                (item.events || []).map(data.formatEvent).join(", "),
                item.email,
            ]),
            [135, 175, contentWidth - 310],
        );

        drawTable(
            "Team Event Registration",
            ["Team", "Event", "Members"],
            data.teams.map((team) => [
                team.teamname,
                data.formatEvent(team.event),
                (team.members || []).map((member) => member.name || "-").join(", "),
            ]),
            [145, 135, contentWidth - 280],
        );

        ensureSpace(125);
        const footerY = y + 6;
        document.image(signaturePath, right - 155, footerY + 3, { fit: [125, 58], align: "center" });
        document.moveTo(right - 165, footerY + 66).lineTo(right, footerY + 66).lineWidth(0.8).strokeColor("#374151").stroke();
        document.font("Helvetica-Bold").fontSize(9.5).fillColor("#111827")
            .text("Signature of Event Head", right - 165, footerY + 73, { width: 165, align: "center" });
        drawCenteredColoredText([
            { text: "Construct ", color: "#14532d" },
            { text: "Carnival ", color: "#ca8a04" },
            { text: "2.0", color: "#c65d13" },
        ], right - 82.5, footerY + 89, 8.5);

        document.end();
    });
}
