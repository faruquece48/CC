import PDFDocument from "pdfkit";
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
    transactionId: string;
    gatewayTransaction: string;
    amount: string | number;
    individual: IndividualRegistration[];
    teams: TeamRegistration[];
    qrCode: Buffer;
    formatEvent: (event: string) => string;
};

export function createPaymentSlipPdf(data: PaymentSlipPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const document = new PDFDocument({ size: "A4", margin: 42 });
        const chunks: Buffer[] = [];
        const pageWidth = document.page.width;
        const contentWidth = pageWidth - 84;

        document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        document.on("end", () => resolve(Buffer.concat(chunks)));
        document.on("error", reject);

        const logoPath = join(process.cwd(), "public", "logo", "blue-main_x1024.png");
        const signaturePath = join(process.cwd(), "public", "images", "signature.png");

        document.image(logoPath, pageWidth / 2 - 35, 34, { fit: [70, 70] });
        document.image(data.qrCode, pageWidth - 122, 34, { fit: [80, 80] });
        document.font("Helvetica-Bold").fontSize(21).fillColor("#111827")
            .text("Construct Carnival 2.0", 42, 112, { width: contentWidth, align: "center" });
        document.font("Helvetica-Bold").fontSize(11).fillColor("#0369a1")
            .text("Building Future, Managing Reality", 42, 140, { width: contentWidth, align: "center" });

        document.rect(42, 166, contentWidth, 34).fill("#064e3b");
        document.font("Helvetica-Bold").fontSize(16).fillColor("#ffffff")
            .text("PAYMENT CONFIRMED", 42, 176, { width: contentWidth, align: "center" });

        let y = 222;
        document.font("Helvetica").fontSize(10).fillColor("#374151")
            .text(`Confirmation for ${data.participantName}`, 42, y);
        y += 25;

        document.rect(42, y, contentWidth, 104).fill("#f0fdf4");
        document.rect(42, y, 4, 104).fill("#16a34a");
        const details = [
            ["Registration ID", String(data.registrationId)],
            ["Payment Status", "Paid"],
            ["Transaction ID", data.transactionId],
            ["Gateway Transaction", data.gatewayTransaction || "-"],
            ["Email", data.email],
            ["Phone", data.phone],
            ["Amount", `${Number(data.amount).toLocaleString()} BDT`],
        ];
        details.forEach(([label, value], index) => {
            const column = index % 2;
            const row = Math.floor(index / 2);
            const x = 58 + column * 255;
            const detailY = y + 14 + row * 23;
            document.font("Helvetica-Bold").fontSize(8).fillColor("#6b7280").text(label.toUpperCase(), x, detailY);
            document.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text(value, x, detailY + 9, { width: 225 });
        });
        y += 126;

        const drawTable = (title: string, headers: string[], rows: string[][], widths: number[]) => {
            if (rows.length === 0) return;
            document.font("Helvetica-Bold").fontSize(13).fillColor("#111827").text(title, 42, y);
            y += 20;
            let x = 42;
            headers.forEach((header, index) => {
                document.rect(x, y, widths[index], 24).fillAndStroke("#f3f4f6", "#d1d5db");
                document.font("Helvetica-Bold").fontSize(8).fillColor("#374151").text(header, x + 6, y + 8, { width: widths[index] - 12 });
                x += widths[index];
            });
            y += 24;
            rows.forEach((row) => {
                const rowHeight = 34;
                x = 42;
                row.forEach((value, index) => {
                    document.rect(x, y, widths[index], rowHeight).stroke("#d1d5db");
                    document.font("Helvetica").fontSize(8).fillColor("#1f2937").text(value || "-", x + 6, y + 7, {
                        width: widths[index] - 12,
                        height: rowHeight - 10,
                    });
                    x += widths[index];
                });
                y += rowHeight;
            });
            y += 22;
        };

        drawTable(
            "Individual Event Registration",
            ["Participant", "Events", "Email"],
            data.individual.map((item) => [
                item.name,
                (item.events || []).map(data.formatEvent).join(", "),
                item.email,
            ]),
            [150, 180, contentWidth - 330],
        );

        drawTable(
            "Team Event Registration",
            ["Team", "Event", "Members"],
            data.teams.map((team) => [
                team.teamname,
                data.formatEvent(team.event),
                (team.members || []).map((member) => member.name || "-").join(", "),
            ]),
            [160, 140, contentWidth - 300],
        );

        const footerY = Math.max(y + 10, 650);
        document.font("Helvetica").fontSize(9).fillColor("#4b5563")
            .text("This is an electronically generated payment slip and requires no further verification.", 42, footerY, {
                width: 330,
            });
        document.image(signaturePath, pageWidth - 190, footerY - 20, { fit: [130, 65], align: "center" });
        document.moveTo(pageWidth - 205, footerY + 52).lineTo(pageWidth - 42, footerY + 52).stroke("#374151");
        document.font("Helvetica-Bold").fontSize(9).fillColor("#111827")
            .text("Signature of Event Head", pageWidth - 205, footerY + 58, { width: 163, align: "center" });
        document.font("Helvetica").fontSize(8).fillColor("#6b7280")
            .text("Construct Carnival 2.0", pageWidth - 205, footerY + 72, { width: 163, align: "center" });

        document.end();
    });
}
