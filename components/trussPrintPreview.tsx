"use client";

import { useMemo, useRef } from "react";
import { examSchedule, trussSlots } from "@/config/competitionSchedule";

export type PublicTrussTeam = {
  id: number; registration_id: number; teamname: string;
  participants: { name: string; email: string; events: string[] }[];
};
export type PublicTrussSchedule = { groups: PublicTrussTeam[][]; unassigned: PublicTrussTeam[]; total: number };

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

export default function TrussPrintPreview({ schedule, detailed = false }: { schedule: PublicTrussSchedule; detailed?: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const document = useMemo(() => {
    let serial = 0;
    const groups = trussSlots.map((slot, index) => ({ label: slot.label, teams: schedule.groups[index] }));
    if (detailed && schedule.unassigned.length) groups.push({ label: "Needs review - time not assigned", teams: schedule.unassigned });
    const pages = groups.flatMap((group) => {
      if (!detailed || !group.teams.length) return [group];
      const chunks: typeof groups = [];
      let chunk: PublicTrussTeam[] = [];
      let rows = 0;
      group.teams.forEach((team) => {
        const count = Math.max(1, team.participants.length);
        if (chunk.length && rows + count > 30) {
          chunks.push({ label: group.label, teams: chunk });
          chunk = []; rows = 0;
        }
        chunk.push(team); rows += count;
      });
      if (chunk.length) chunks.push({ label: group.label, teams: chunk });
      return chunks;
    });
    return `<!doctype html><html><head><meta charset="utf-8"><title>Truss Combat — Hourly Schedule</title><style>
      *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:#e2e8f0;font-family:"Times New Roman",Times,serif;color:#172e29}
      .page{width:210mm;height:297mm;padding:10mm;background:white;margin:12px auto;overflow:hidden;position:relative}
      .content{transform-origin:top center}.document-header{text-align:center;padding:3mm 4mm 5mm;margin-bottom:4mm;border-top:1.2mm solid #09a6aa;border-bottom:.3mm solid #dfd1ef;background:linear-gradient(120deg,#effbfb,#fff 50%,#faf2ff)}h1{font-size:27pt;letter-spacing:-.8pt;margin:2mm 0 3mm;color:#000}h2{display:inline-block;font-size:15pt;letter-spacing:.4pt;margin:0 0 3mm;padding:1.5mm 6mm;border:1px solid #cbd5e1;border-radius:20mm;background:#f1f5f9;color:#475569}.document-header .details{margin:0;font-size:9pt;color:#456158}
      p{font-size:9pt;margin:0 0 3mm;line-height:1.4}.eyebrow{font-size:8pt;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:#547166;margin:0}
      .brand{display:flex;align-items:center;justify-content:center;gap:3mm;margin:0 0 3mm}.brand img{width:16mm;height:16mm;object-fit:contain}.brand-name{text-align:left;font-size:15pt;font-weight:900;line-height:1.1;letter-spacing:-.4pt}.brand-name span{display:block}.construct{color:#069faa}.carnival{color:#ff625b}.edition{color:#a330e8}.brand-name .edition{display:inline}
      table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8pt;line-height:1.25}th,td{padding:1.1mm 1.3mm;border:1px solid #000;text-align:left;overflow-wrap:anywhere;vertical-align:top}
      th.center,td.center{text-align:center;vertical-align:middle}
      th{overflow-wrap:normal;word-break:normal;background:#e8f8f8;color:#087f89;border-bottom:2px solid #000}tr:nth-child(even){background:#faf7fd}.note{margin-top:3mm;font-size:8pt}.footer{position:absolute;bottom:5mm;left:10mm;right:10mm;font-size:8pt;display:flex;justify-content:center}
      @media screen{body{zoom:.5}.page{box-shadow:0 4px 20px #0002}}
      @page{size:A4 portrait;margin:0}@media print{html,body{background:white;zoom:1}.page{margin:0;break-after:page;box-shadow:none}.page:last-child{break-after:auto}}
    </style></head><body>${pages.map((slot, index) => {
      const teams = slot.teams;
      return `<section class="page"><div class="content"><header class="document-header"><div class="brand"><img src="/logo/blue-main.svg" alt="Construct Carnival logo" width="60" height="60"><div class="brand-name"><span class="construct">CONSTRUCT</span><span class="carnival">CARNIVAL <span class="edition">2.0</span></span></div></div><h1>Truss Combat</h1><h2>${escapeHtml(slot.label)}</h2><p class="details">Department of BECM, RUET · ${teams.length} teams · ${teams.reduce((n, team) => n + team.participants.length, 0)} participants</p></header>
      ${detailed ? `<table><colgroup>${[5, 10, 15, 19, 23, 6, 10, 12].map((width) => `<col style="width:${width}%">`).join("")}</colgroup><thead><tr><th class="center">No.</th><th class="center">Registration ID</th><th>Team name</th><th>Team member</th><th>Email ID</th><th>CAD</th><th>Mechamind</th><th>Management Maestro</th></tr></thead><tbody>${teams.length ? teams.map((team) => {
        const number = ++serial;
        const members = team.participants.length ? team.participants : [{ name: "Missing member details", email: "", events: [] as string[] }];
        return members.map((member, memberIndex) => `<tr>${memberIndex === 0 ? `<td class="center" rowspan="${members.length}">${number}</td><td class="center" rowspan="${members.length}">${escapeHtml(team.registration_id)}</td><td rowspan="${members.length}">${escapeHtml(team.teamname || "Unnamed team")}</td>` : ""}<td>${escapeHtml(member.name)}</td><td>${escapeHtml(member.email?.trim() || "Not provided")}</td>${examSchedule.map((exam) => `<td style="text-align:center;color:#000;font-weight:bold">${member.events.includes(exam.key) ? "&#10003;" : ""}</td>`).join("")}</tr>`).join("");
      }).join("") : '<tr><td colspan="8">No teams assigned to this hour.</td></tr>'}</tbody></table>` : `<table><colgroup><col style="width:7%"><col style="width:14%"><col style="width:25%"><col style="width:54%"></colgroup><thead><tr><th class="center">No.</th><th class="center">Registration ID</th><th>Team name</th><th>Team members</th></tr></thead><tbody>${teams.length ? teams.map((team) => `<tr><td class="center">${++serial}</td><td class="center">${escapeHtml(team.registration_id)}</td><td>${escapeHtml(team.teamname || "Unnamed team")}</td><td>${team.participants.map((member) => escapeHtml(member.name)).join(" · ")}</td></tr>`).join("") : '<tr><td colspan="4">No teams assigned to this hour.</td></tr>'}</tbody></table>`}

      <p class="note">Please attend during your assigned time. Assignments are based on current registrations and the event exam schedule.${schedule.unassigned.length ? ` ${schedule.unassigned.length} team(s) await assignment and are not included in these time slots.` : ""}</p></div><div class="footer"><span>${index + 1} / ${pages.length}</span></div></section>`;
    }).join("")}<script>function fit(){document.querySelectorAll('.page').forEach(function(page){var content=page.querySelector('.content');content.style.transform='';var available=page.clientHeight-95;var scale=Math.min(1,available/content.scrollHeight);content.style.transform='scale('+scale+')';});}window.addEventListener('load',fit);window.addEventListener('beforeprint',fit);fit();</script></body></html>`;
  }, [schedule, detailed]);

  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{detailed ? "Full table PDF preview" : "Hourly schedule PDF preview"}</h2><p className="mt-1 text-sm text-slate-600">{detailed ? "Complete tables with each member's email and event ticks, grouped by time. Includes teams needing review." : "One page per hour, including every assigned team member. Four pages total."}</p></div>
      <button onClick={() => { frame.current?.contentWindow?.focus(); frame.current?.contentWindow?.print(); }} className="rounded-lg bg-[#073f37] px-5 py-3 font-semibold text-white">Print / Save as PDF</button></div>
    <p className="mt-3 text-sm text-slate-500">Choose “Save as PDF” in the print dialog to create an email attachment. Use A4 paper, 100% scale, no margins, and enable background graphics. Turn off browser headers and footers.</p>
    <div className="mt-4 overflow-x-auto rounded-xl bg-slate-200"><iframe ref={frame} title={detailed ? "Full Truss table A4 preview" : "Hourly Truss schedule A4 preview"} srcDoc={document} className="mx-auto h-[590px] w-full min-w-[420px] max-w-[480px] border-0" /></div>
  </section>;
}
