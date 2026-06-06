import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abdullahruet13@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({

      from: "abdullahruet13@gmail.com",

      replyTo: body.email,

      to: "abdullahruet13@gmail.com",

      subject: `Contact Form: ${body.subject}`,

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">

          <h2 style="color:#e11d48;">
            New Contact Message
          </h2>

          <hr />

          <p>
            <strong>Name:</strong> ${body.fullName}
          </p>

          <p>
            <strong>Email:</strong> ${body.email}
          </p>

          <p>
            <strong>Subject:</strong> ${body.subject}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

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
      message: "Email sent successfully",
    });

  } catch (error) {

    console.log("EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email",
      },
      { status: 500 }
    );
  }
}