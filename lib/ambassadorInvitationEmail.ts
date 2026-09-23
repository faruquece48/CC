import type { Ambassador } from "@/lib/ambassadors";

const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

export const ambassadorInvitationSubject = "Official Invitation | Campus Ambassador | Construct Carnival 2.0";

export function ambassadorInvitationHtml(person: Ambassador) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>@media(max-width:620px){.wrap{padding:10px!important}.card{padding:24px 18px!important}.detail{display:block!important;width:100%!important}.title{font-size:31px!important}}</style></head>
<body style="margin:0;background:#e9eee9;padding:28px 10px;font-family:Arial,Helvetica,sans-serif;color:#26342f">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;background:#fffdf7;border:1px solid #d5bd82;box-shadow:0 14px 38px rgba(7,63,55,.16)">
<tr><td style="height:8px;background:#073f37"></td></tr>
<tr><td class="card" style="padding:34px 44px 28px;text-align:center;border-bottom:1px solid #e2d3ad">
<img src="https://constructcarnival.com/logo/blue-main_x1024.png" width="118" alt="Construct Carnival 2.0" style="display:block;width:118px;height:auto;margin:0 auto 16px">
<p style="margin:0;color:#b08735;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase">Official Invitation</p>
<h1 class="title" style="margin:10px 0 2px;color:#073f37;font-family:Georgia,serif;font-size:40px;font-weight:normal">Construct Carnival 2.0</h1>
<p style="margin:9px 0 0;color:#62706b;font-size:13px;letter-spacing:1px">BUILDING FUTURE, MANAGING REALITY</p>
</td></tr>
<tr><td class="card" style="padding:34px 44px">
<p style="margin:0 0 18px;font-family:Georgia,serif;font-size:20px;color:#073f37"><strong>Dear ${esc(person.name)},</strong></p>
<p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#44504c">With great pleasure, the Department of Building Engineering &amp; Construction Management, RUET, cordially invites you to join <strong style="color:#073f37">Construct Carnival 2.0</strong> as our valued <strong style="color:#073f37">Campus Ambassador</strong>. Your leadership and contribution have helped connect this celebration with students across the country.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;border-collapse:separate;border-spacing:0;background:#073f37;color:#fff">
<tr><td class="detail" width="50%" valign="top" align="center" style="padding:24px 22px;text-align:center;border-right:1px solid rgba(240,201,106,.45)"><p style="margin:0 0 5px;color:#f0c96a;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Date &amp; Time</p><p style="margin:0;font-family:Georgia,serif;font-size:18px;line-height:1.5">Saturday, 03 October 2026<br><span style="font-family:Arial,sans-serif;font-size:13px;color:#d8e5e1">From 8:00 AM</span></p></td>
<td class="detail" width="50%" valign="top" align="center" style="padding:24px 22px;text-align:center"><p style="margin:0 0 5px;color:#f0c96a;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Venue</p><p style="margin:0;font-family:Georgia,serif;font-size:18px;line-height:1.5">RUET Auditorium<br><span style="font-family:Arial,sans-serif;font-size:13px;color:#d8e5e1">&amp; Department of BECM</span></p></td></tr>
</table>
<table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:25px auto;border:1px solid #d6bd80;background:#faf5e8"><tr><td style="padding:14px 18px;color:#75633e;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Ambassador Code</td><td style="padding:14px 18px 14px 4px;color:#073f37;font-family:Georgia,serif;font-size:23px;font-weight:bold">${esc(person.code)}</td></tr></table>
<div style="margin:25px 0;padding:17px 19px;border-left:4px solid #d2a443;background:#f7f2e6;color:#4d554f;font-size:14px;line-height:1.7"><strong style="color:#073f37">Your presence matters.</strong> Please bring your ambassador QR codes for kit and lunch collection and arrive in time for check-in.</div>
<table role="presentation" align="center" cellspacing="0" cellpadding="0"><tr><td style="border-radius:5px;background:#c69232"><a href="https://constructcarnival.com/schedule" style="display:inline-block;padding:13px 24px;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:.5px">VIEW EVENT SCHEDULE</a></td></tr></table>
<p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #e5d9bc;font-size:14px;line-height:1.7;color:#59635f"><strong style="color:#073f37">Warm regards,</strong><br>Event Organizing Committee<br><span style="color:#b08735;font-weight:bold">Construct Carnival 2.0</span><br>Department of BECM, RUET</p>
</td></tr>
<tr><td style="padding:15px 20px;background:#073f37;text-align:center;color:#dce9e4;font-size:10px;letter-spacing:2px;text-transform:uppercase">We look forward to welcoming you</td></tr>
</table></td></tr></table></body></html>`;
}

export function ambassadorInvitationText(person: Ambassador) {
  return `Dear ${person.name},\n\nYou are cordially invited to Construct Carnival 2.0 as a valued Campus Ambassador.\n\nDate: Saturday, 03 October 2026, from 8:00 AM\nVenue: RUET Auditorium and Department of BECM\nAmbassador Code: ${person.code}\n\nEvent schedule: https://constructcarnival.com/schedule\n\nWarm regards,\nEvent Organizing Committee\nConstruct Carnival 2.0\nDepartment of BECM, RUET`;
}
