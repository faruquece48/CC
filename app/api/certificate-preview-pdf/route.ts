import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { createParticipationCertificatePdf } from "@/lib/participationCertificatePdf";

function authorized(password: unknown, request: Request) {
  const hostname = new URL(request.url).hostname;
  if (process.env.NODE_ENV === "development"
    && (hostname === "localhost" || hostname === "127.0.0.1")
    && password === "local-development") return true;
  const normalize = (value: string) => value.replace(/\s+/g, "");
  const provided = Buffer.from(normalize(typeof password === "string" ? password : ""));
  const expected = Buffer.from(normalize(process.env.ADMIN_PASSWORD || ""));
  return Boolean(process.env.ADMIN_PASSWORD)
    && provided.length === expected.length
    && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  try {
    const { password, name, email, events, participants } = await request.json();
    if (!authorized(password, request)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const requestedParticipants = Array.isArray(participants)
      ? participants
      : [{ name, email, events }];
    const validParticipants = requestedParticipants.filter((participant) =>
      typeof participant?.name === "string"
      && typeof participant?.email === "string"
      && Array.isArray(participant?.events));
    if (validParticipants.length === 0 || validParticipants.length !== requestedParticipants.length) {
      return NextResponse.json({ success: false, message: "Invalid participant data." }, { status: 400 });
    }

    const certificatePdfs = await Promise.all(validParticipants.map((participant) =>
      createParticipationCertificatePdf({
        name: participant.name.trim() || "Participant Name",
        email: participant.email.trim(),
        events: participant.events.map(String),
      }, { protect: false })));
    const combinedPdf = await PDFDocument.create();
    for (const certificatePdf of certificatePdfs) {
      const sourcePdf = await PDFDocument.load(certificatePdf);
      const [page] = await combinedPdf.copyPages(sourcePdf, [0]);
      combinedPdf.addPage(page);
    }
    const pdf = await combinedPdf.save();
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=certificate-preview.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("CERTIFICATE PDF PREVIEW ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to generate the PDF preview." }, { status: 500 });
  }
}
