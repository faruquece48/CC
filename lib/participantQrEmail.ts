const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

type ParticipantQrEmailData = { name: string; registrationId: number | string; email: string; phone: string; ambassador: boolean };

export const participantQrEmailSubject = "Your Kit Collection and Lunch QR Codes - Construct Carnival 2.0";

export function participantQrEmailText({ name, registrationId, email, phone, ambassador }: ParticipantQrEmailData) {
  return `Dear ${name},\n\nYour unique QR codes for kit collection and lunch are attached. Please present the correct code at each collection point.\n\nCOLLECTION SCHEDULE\nKit Collection (Pre-event): Friday, 02 October 2026, 5:00 PM - 6:00 PM, Department of BECM\nKit Collection & Check-in: Saturday, 03 October 2026, 8:00 AM - 9:00 AM, RUET Auditorium\nLunch Collection & Midday Break: Saturday, 03 October 2026, 12:30 PM - 2:00 PM, BECM Department\n\nRegistration ID: ${registrationId}${ambassador ? " (Campus Ambassador)" : ""}\nPhone Number: ${phone}\n\nDo not share or forward these QR codes. Each code works only once.\n\nBest regards,\nConstruct Carnival 2.0\nDepartment of BECM, RUET`;
}

export function participantQrEmailHtml({ name, registrationId, email, phone, ambassador }: ParticipantQrEmailData) {
  const badge = ambassador ? ' <span style="display:inline-block;margin-left:6px;padding:3px 8px;border-radius:999px;background:#d1fae5;color:#065f46;font-size:11px;font-weight:700">Campus Ambassador</span>' : "";
  const rows = [
    ["KIT - PRE-EVENT", "Friday, 02 October 2026", "5:00 PM - 6:00 PM", "Department of BECM"],
    ["KIT & CHECK-IN", "Saturday, 03 October 2026", "8:00 AM - 9:00 AM", "RUET Auditorium"],
    ["LUNCH COLLECTION", "Saturday, 03 October 2026", "12:30 PM - 2:00 PM", "BECM Department"],
  ].map(([label,date,time,venue]) => `<tr><td style="padding:12px;border-top:1px solid #dbe5e2"><div style="color:#087f78;font-size:10px;font-weight:bold;letter-spacing:1px">${label}</div><div style="margin-top:3px;color:#173b35;font-size:13px;font-weight:bold">${date}</div></td><td style="padding:12px;border-top:1px solid #dbe5e2;color:#334155;font-size:12px;font-weight:bold;white-space:nowrap">${time}</td><td style="padding:12px;border-top:1px solid #dbe5e2;color:#475569;font-size:12px">${venue}</td></tr>`).join("");
  return `<!doctype html><html><body style="margin:0;background:#edf3f1;padding:24px 10px;font-family:Arial,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="660" cellpadding="0" cellspacing="0" style="width:100%;max-width:660px;background:#fff;border:1px solid #d5e1dd">
    <tr><td style="height:7px;background:#073f37"></td></tr>
    <tr><td style="padding:28px 34px;text-align:center;border-bottom:1px solid #dbe5e2"><img src="https://constructcarnival.com/logo/blue-main_x1024.png" width="120" alt="Construct Carnival 2.0" style="display:block;margin:0 auto 14px;width:120px;height:auto"><p style="margin:0;color:#b08735;font-size:10px;font-weight:bold;letter-spacing:3px;text-transform:uppercase">Collection Pass</p><h1 style="margin:8px 0 0;color:#073f37;font-family:Georgia,serif;font-size:27px;font-weight:normal">Kit &amp; Lunch QR Codes</h1></td></tr>
    <tr><td style="padding:30px 34px"><p style="margin:0 0 16px"><strong>Dear ${esc(name)},</strong></p><p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#475569">Your personal QR codes are attached. Present the correct code at the relevant collection desk.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px auto;background:#f8fbfa;border:1px solid #dbe5e2;text-align:center"><tr><td style="padding:11px 14px;font-size:12px"><strong style="color:#073f37">Registration ID:</strong> ${esc(registrationId)}${badge}</td></tr><tr><td style="padding:0 14px 11px;font-size:12px"><strong style="color:#073f37">Phone Number:</strong> ${esc(phone)}</td></tr></table>
    <h2 style="margin:24px 0 10px;color:#073f37;font-size:14px;text-transform:uppercase;letter-spacing:1.5px">Collection schedule</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #dbe5e2;border-collapse:collapse"><tr style="background:#073f37"><th style="padding:10px 12px;color:#f5d77a;font-size:10px;text-align:left;letter-spacing:1px">PURPOSE &amp; DATE</th><th style="padding:10px 12px;color:#f5d77a;font-size:10px;text-align:left;letter-spacing:1px">TIME</th><th style="padding:10px 12px;color:#f5d77a;font-size:10px;text-align:left;letter-spacing:1px">VENUE</th></tr>${rows}</table>
    <div style="margin-top:22px;padding:14px 16px;border-left:4px solid #d4a843;background:#fff7df;color:#7c4a03;font-size:13px;line-height:1.6"><strong>Important:</strong> Do not share or forward these QR codes. Each code works only once. If another person uses your code first, you may be unable to collect your own kit or lunch.</div>
    <p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #dbe5e2;font-size:13px;line-height:1.7"><strong style="color:#073f37">Best regards,</strong><br>Construct Carnival 2.0<br>Department of BECM, RUET</p></td></tr>
    <tr><td style="padding:13px;background:#073f37;text-align:center;color:#dce9e4;font-size:9px;letter-spacing:1.6px;text-transform:uppercase">Building Future, Managing Reality</td></tr>
  </table></td></tr></table></body></html>`;
}
