import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "node:path";
import { ambassadors } from "@/lib/ambassadors";

const subject = "Congratulations! You're Selected as a \u201cCampus Ambassador\u201d for Construct Carnival 2.0";
const esc = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

function emailHtml(name: string, code: string) {
  return `<div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.65;max-width:760px;margin:auto;text-align:justify">
  <p>Dear <strong>${esc(name)}</strong>,</p>
  <p><strong>Congratulations!</strong> We are delighted to inform you that you have been selected as a Campus Ambassador for <strong>Construct Carnival 2.0</strong> representing your campus. We were impressed by your profile and enthusiasm, and we're excited to have you on board.</p>
  <p style="font-size:20px"><strong>Your Code: ${esc(code)}</strong></p>
  <blockquote style="border-left:4px solid #059669;margin:20px 0;padding:10px 16px;background:#ecfdf5"><strong>Participants must provide a reference code, which will be used to identify and count the participants associated with your reference.</strong></blockquote>
  <p>As a Campus Ambassador, you'll play a key role in bringing Construct Carnival 2.0 to your campus community. Please go through your responsibilities below carefully:</p>
  <h3>Your Responsibilities</h3><ul>
  <li><strong>Social Media Promotion:</strong> Share official posts, posters, and updates from your personal Facebook account.</li>
  <li><strong>Keep Your Facebook Profile Public:</strong> Keep it public throughout the campaign so promotional activity can be verified.</li>
  <li><strong>Campus Notice Board / Common Room Posting:</strong> Put up official event posters or flyers.</li>
  <li><strong>On-Campus Campaign:</strong> Promote the event to classmates, seniors, juniors, class groups, and department pages.</li>
  <li><strong>Drive Registrations:</strong> Encourage students from your university to register. The minimum target will be shared separately.</li></ul>
  <h3>What You'll Receive</h3><ul><li>An official Campus Ambassador Certificate</li><li>Food/refreshments for your participation and effort</li></ul>
  <p><strong>&#127942; Best Campus Ambassador Award:</strong> The Ambassador who brings in the highest number of registered participants from their campus will receive the title <strong>Best Campus Ambassador</strong>, along with special recognition.</p>
  <p>We have attached the Construct Carnival poster for your convenience. If you have questions, feel free to reach out and join the WhatsApp group.</p>
  <p><strong>WhatsApp group:</strong> <a href="https://chat.whatsapp.com/Jz1XOGnkRYEInmFrZkNQd6?s=cl&p=a&mlu=4&ilr=4">Join the group</a><br><strong>Registration:</strong> <a href="https://www.constructcarnival.com/registration">constructcarnival.com/registration</a></p>
  <p>Once again, congratulations, and welcome to the <strong>Construct Carnival 2.0</strong> family! We look forward to working with you.</p>
  <p>Warm regards,<br><strong>Organizing Team<br>Construct Carnival 2.0</strong></p></div>`;
}

export async function POST(request: Request) {
  try {
    const { action, codes } = await request.json();
    if (action === "list") return NextResponse.json({ ambassadors, subject });
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return NextResponse.json({ message: "Email service is not configured" }, { status: 500 });
    const selected = ambassadors.filter(({ code }) => Array.isArray(codes) && codes.includes(code));
    if (!selected.length) return NextResponse.json({ message: "Select at least one ambassador" }, { status: 400 });
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
    const results = [];
    for (const ambassador of selected) {
      try {
        await transporter.sendMail({ from: `"Construct Carnival" <${process.env.GMAIL_USER}>`, to: ambassador.email, subject, html: emailHtml(ambassador.name, ambassador.code), attachments: [{ filename: "Construct-Carnival-2.0-Poster.jpeg", path: path.join(process.cwd(), "public", "images", "poster.jpeg") }] });
        results.push({ code: ambassador.code, status: "sent" });
      } catch (error) {
        console.error("AMBASSADOR EMAIL:", ambassador.code, error);
        results.push({ code: ambassador.code, status: "failed" });
      }
    }
    const sent = results.filter(({ status }) => status === "sent").length;
    return NextResponse.json({ sent, failed: results.length - sent, results }, { status: sent ? 200 : 502 });
  } catch (error) {
    console.error("AMBASSADOR EMAIL:", error);
    return NextResponse.json({ message: "Unable to process ambassador email request" }, { status: 500 });
  }
}
