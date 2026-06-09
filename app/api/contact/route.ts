import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check environment variables
    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email configuration is missing.",
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Verify SMTP connection
    await transporter.verify();

    // Send email
    await transporter.sendMail({
      from: `"Construct Carnival" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: body.email,
      subject: `Contact Form: ${body.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color:#e11d48;">
            New Contact Message
          </h2>

          <hr />

          <p><strong>Name:</strong> ${body.fullName}</p>

          <p><strong>Email:</strong> ${body.email}</p>

          <p><strong>Subject:</strong> ${body.subject}</p>

          <p><strong>Message:</strong></p>

          <div style="
            background:#f5f5f5;
            padding:15px;
            border-radius:8px;
            line-height:1.6;
          ">
            ${body.message}
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
    });

  } catch (error: any) {
    console.error("EMAIL ERROR:", error);
    console.error("MESSAGE:", error?.message);
    console.error("CODE:", error?.code);
    console.error("RESPONSE:", error?.response);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to send email.",
      },
      { status: 500 }
    );
  }
}