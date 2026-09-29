"use client";

import { useMemo, useRef } from "react";
import { examSchedule } from "@/config/competitionSchedule";

export type IndividualEventKey = "cad" | "mechamind" | "management";
export type PublicIndividualParticipant = { registration_id: number; name: string };

const scheduleTimes = Object.fromEntries(examSchedule.map((item) => [item.key, item.time])) as Record<IndividualEventKey, string>;

const details: Record<IndividualEventKey, { title: string; time: string; rooms: { name: string; capacity: number }[] }> = {
  cad: { title: "CAD Expert", time: scheduleTimes.cad, rooms: [{ name: "3402", capacity: 40 }, { name: "3403", capacity: 40 }, { name: "3404", capacity: Infinity }] },
  mechamind: { title: "Mechamind", time: scheduleTimes.mechamind, rooms: [{ name: "3402", capacity: 30 }, { name: "3403", capacity: 30 }, { name: "3404", capacity: Infinity }] },
  management: { title: "Management Maestro", time: scheduleTimes.management, rooms: [{ name: "3402", capacity: 23 }, { name: "3403", capacity: 23 }] },
};
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));

export default function IndividualEventPrintPreview({ event, participants }: { event: IndividualEventKey; participants: PublicIndividualParticipant[] }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const eventDetails = details[event];
  const document = useMemo(() => {
    let assigned = 0;
    const roomGroups = eventDetails.rooms.map((room) => {
      const remaining = Math.max(0, participants.length - assigned);
      const count = Number.isFinite(room.capacity) ? Math.min(room.capacity, remaining) : remaining;
      const group = { room: room.name, start: assigned, participants: participants.slice(assigned, assigned + count) };
      assigned += count;
      return group;
    }).filter((group) => group.participants.length);
    if (assigned < participants.length) roomGroups.push({ room: "Unassigned", start: assigned, participants: participants.slice(assigned) });
    if (!roomGroups.length) roomGroups.push({ room: eventDetails.rooms[0].name, start: 0, participants: [] });
    const table = (rows: PublicIndividualParticipant[], start: number) => `<table><thead><tr><th>No.</th><th>Registration ID</th><th>Participant</th></tr></thead><tbody>${rows.length ? rows.map((participant, index) => `<tr><td class="center">${start + index + 1}</td><td class="center">${esc(participant.registration_id)}</td><td>${esc(participant.name)}</td></tr>`).join("") : '<tr><td colspan="3">No participant</td></tr>'}</tbody></table>`;
    const style = `*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:#e2e8f0;font-family:"Times New Roman",serif;color:#172e29}.page{width:210mm;height:297mm;padding:10mm;background:white;margin:12px auto;overflow:hidden;position:relative;display:flex;flex-direction:column}.header{text-align:center;padding:3mm 4mm 5mm;margin-bottom:4mm;border-top:1.2mm solid #09a6aa;border-bottom:.3mm solid #dfd1ef;background:linear-gradient(120deg,#effbfb,#fff 50%,#faf2ff)}.brand{display:flex;align-items:center;justify-content:center;gap:3mm}.brand img{width:16mm;height:16mm}.brand-name{text-align:left;font-size:15pt;font-weight:900;line-height:1.1}.construct{color:#069faa}.carnival{color:#ff625b}.edition{color:#a330e8}h1{font-size:25pt;margin:2mm 0 1mm;color:#000}h2{display:inline-block;font-size:11pt;margin:0;padding:1.2mm 4mm;border:1px solid #cbd5e1;border-radius:20mm;background:#f1f5f9;color:#475569}.details{font-size:9pt;margin:2mm 0 0;color:#456158}.participant-columns{padding-bottom:7mm;display:grid;align-items:start;justify-content:center;gap:3mm}.room-column{min-width:0;display:flex;flex-direction:column}.room-heading{width:100%;margin:0 0 2mm;padding:1.5mm 3mm;border:1px solid #087f89;border-radius:20mm;background:#e8f8f8;color:#065f66;text-align:center;font-size:11pt;font-weight:700}table{width:max-content;max-width:100%;height:auto;margin:0 auto;border-collapse:collapse;table-layout:auto;font-size:6.8pt;line-height:1.15}th,td{padding:1mm;border:1px solid #000;text-align:left;overflow-wrap:anywhere;vertical-align:top}th{background:#e8f8f8;color:#087f89;border-bottom:2px solid #000;text-align:center;vertical-align:middle}.center{text-align:center;vertical-align:middle}.footer{position:absolute;bottom:5mm;left:10mm;right:10mm;text-align:center;font-size:8pt}@media screen{body{zoom:.5}.page{box-shadow:0 4px 20px #0002}}@page{size:A4 portrait;margin:0}@media print{html,body{background:white;zoom:1}.page{margin:0;break-after:page;box-shadow:none}.page:last-child{break-after:auto}}`;
    const body = `<section class="page"><header class="header"><div class="brand"><img src="/logo/blue-main.svg" alt="Construct Carnival logo"><div class="brand-name"><span class="construct">CONSTRUCT</span><br><span class="carnival">CARNIVAL <span class="edition">2.0</span></span></div></div><h1>${eventDetails.title}</h1><h2>${eventDetails.time}</h2><p class="details">Department of BECM, RUET &middot; ${participants.length} participants</p></header><div class="participant-columns" style="grid-template-columns:repeat(${roomGroups.length},max-content)">${roomGroups.map((group) => `<div class="room-column"><div class="room-heading">Room ${esc(group.room)}</div>${table(group.participants, group.start)}</div>`).join("")}</div><div class="footer">1 / 1</div></section>`;
    return `<!doctype html><html><head><meta charset="utf-8"><title>${eventDetails.title} - Participant List</title><style>${style}</style></head><body>${body}</body></html>`;
  }, [eventDetails, participants]);

  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{eventDetails.title} PDF preview</h2><p className="mt-1 text-sm text-slate-600">Paid individual participants · {participants.length} records</p></div><button onClick={() => { frame.current?.contentWindow?.focus(); frame.current?.contentWindow?.print(); }} className="rounded-lg bg-[#073f37] px-5 py-3 font-semibold text-white">Print / Save as PDF</button></div>
    <p className="mt-3 text-sm text-slate-500">Use A4 paper, 100% scale, no margins, and enable background graphics.</p>
    <div className="mt-4 overflow-x-auto rounded-xl bg-slate-200"><iframe ref={frame} title={`${eventDetails.title} A4 preview`} srcDoc={document} className="mx-auto h-[590px] w-full min-w-[420px] max-w-[480px] border-0" /></div>
  </section>;
}