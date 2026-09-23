const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

export type CancellationParticipant = { name: string; email: string; event: string };

export function cancellationEmail(id: number, participants: CancellationParticipant[]) {
  const rows = participants.map((participant, index) => `<tr>
    <td style="padding:10px 12px;border-top:1px solid #e4dac4;color:#756a57;font:12px Arial,sans-serif;text-align:center">${index + 1}</td>
    <td style="padding:10px 12px;border-top:1px solid #e4dac4;color:#173f3a;font:bold 13px Arial,sans-serif">${esc(participant.name)}</td>
    <td style="padding:10px 12px;border-top:1px solid #e4dac4;color:#4b4b45;font:12px Arial,sans-serif">${esc(participant.event)}</td>
  </tr>`).join("");
  const html = `<div style="margin:0;background:#f3efe6;padding:28px 12px;font-family:Georgia,'Times New Roman',serif;color:#263238">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;margin:0 auto;background:#fffdf8;border:1px solid #d8c9a7;box-shadow:0 12px 35px rgba(50,42,28,.12)">
    <tr><td style="height:7px;background:#173f3a"></td></tr>
    <tr><td style="padding:34px 38px 26px;text-align:center;border-bottom:1px solid #d8c9a7">
      <img src="https://constructcarnival.com/logo/blue-main_x1024.png" width="150" alt="Construct Carnival 2.0" style="display:block;width:150px;max-width:60%;height:auto;margin:0 auto;border:0">
      <p style="margin:16px 0 5px;color:#b08b3e;font:700 11px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase">Official Notice</p>
      <h1 style="margin:0;color:#173f3a;font-size:28px;font-weight:normal;line-height:1.25">Registration Cancellation</h1>
      <p style="margin:8px 0 0;color:#6b6254;font:13px Arial,sans-serif">Construct Carnival 2.0</p>
    </td></tr>
    <tr><td style="padding:34px 42px">
      <p style="margin:0 0 20px;font-size:17px"><strong>Dear Participant,</strong></p>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#4b4b45">This is to formally notify you that your registration for <strong style="color:#173f3a">Construct Carnival 2.0</strong> has been canceled by the event administration.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:auto;min-width:285px;margin:24px auto;border:1px solid #d8c9a7;background:#faf7ef"><tr>
        <td style="padding:14px 12px 14px 16px;color:#756a57;font:11px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap">Registration ID</td>
        <td style="padding:14px 16px 14px 12px;color:#173f3a;font:bold 21px Georgia,serif;white-space:nowrap">${id}</td>
      </tr></table>
      <div style="margin:25px 0">
        <p style="margin:0 0 10px;color:#173f3a;font:bold 12px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase">Participant Information</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #d8c9a7;border-collapse:collapse;background:#fffdf8">
          <tr style="background:#173f3a"><th style="padding:10px 12px;color:#e8dcc1;font:bold 10px Arial,sans-serif;text-align:center">#</th><th style="padding:10px 12px;color:#e8dcc1;font:bold 10px Arial,sans-serif;text-align:left;letter-spacing:1px">PARTICIPANT NAME</th><th style="padding:10px 12px;color:#e8dcc1;font:bold 10px Arial,sans-serif;text-align:left;letter-spacing:1px">EVENT</th></tr>
          ${rows}
        </table>
      </div>
      <p style="margin:0 0 26px;font-size:15px;line-height:1.8;color:#4b4b45">This registration and its associated participant services will no longer be active. If you believe this notice was issued in error, please contact the event organizing committee.</p>
      <div style="margin:0 0 26px;padding:14px 16px;border-left:4px solid #b08b3e;background:#faf7ef;color:#504a40;font:14px Arial,sans-serif;line-height:1.65"><strong style="color:#173f3a">Refund update:</strong> You will be informed of the refund schedule soon.</div>
      <div style="padding-top:20px;border-top:1px solid #e4dac4;font-size:14px;line-height:1.7;color:#504a40"><strong style="color:#173f3a">With regards,</strong><br>Event Organizing Committee<br><span style="color:#b08b3e">Construct Carnival 2.0</span><br>Department of BECM, RUET</div>
    </td></tr>
    <tr><td style="padding:15px 24px;background:#173f3a;text-align:center;color:#e8dcc1;font:10px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase">Building Future, Managing Reality</td></tr>
  </table></div>`;
  return { subject: `Registration ${id} canceled - Construct Carnival 2.0`, html };
}
