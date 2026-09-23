"use client";

import { useMemo, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, Database, Loader2, Mail, MapPin, RefreshCw, Search, Send, ShieldCheck, XCircle } from "lucide-react";

type Person = { code:string; name:string; email:string; university:string; department:string; invitation_status:"not_sent"|"sending"|"sent"|"failed"; invitation_sent_at:string|null };
const passwordKey = "construct-carnival-amb-invitation-password";

export default function AmbassadorInvitationPage() {
  const [password,setPassword]=useState(()=>typeof window==="undefined"?"":localStorage.getItem(passwordKey)||"");
  const passwordInputRef=useRef<HTMLInputElement>(null);
  const [people,setPeople]=useState<Person[]>([]);
  const [checked,setChecked]=useState<string[]>([]);
  const [selectedCode,setSelectedCode]=useState("");
  const [query,setQuery]=useState("");
  const [loading,setLoading]=useState(false);
  const [sending,setSending]=useState(false);
  const [forceResend,setForceResend]=useState(false);
  const [status,setStatus]=useState("");

  const selected=people.find(person=>person.code===selectedCode)||people[0];
  const filtered=useMemo(()=>{const term=query.trim().toLowerCase();return term?people.filter(person=>[person.code,person.name,person.email,person.university,person.department].some(value=>value.toLowerCase().includes(term))):people},[people,query]);
  const sentTotal=people.filter(person=>person.invitation_status==="sent").length;
  const failedCodes=people.filter(person=>person.invitation_status==="failed").map(person=>person.code);
  const remainingTotal=people.length-sentTotal;

  async function load() {
    const currentPassword=passwordInputRef.current?.value||password;
    if(!currentPassword){setStatus("Enter the admin password first.");return;}
    setPassword(currentPassword);setLoading(true);setStatus("");
    try {
      localStorage.setItem(passwordKey,currentPassword);
      const response=await fetch("/api/ambassador-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:currentPassword,action:"list"})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.message||"Unable to load campus ambassadors.");
      const loaded:Person[]=data.ambassadors||[];
      setPeople(loaded);
      setChecked(loaded.filter(person=>person.invitation_status!=="sent").map(person=>person.code));
      setSelectedCode(current=>current||loaded[0]?.code||"");
      setStatus(`${loaded.length} campus ambassadors loaded.`);
    } catch(error){setStatus(error instanceof Error?error.message:"Unable to load campus ambassadors.");}
    finally{setLoading(false)}
  }

  async function send(codes:string[]) {
    if(!codes.length||sending)return;
    if(!confirm(`Send the official invitation to ${codes.length} campus ambassador email address(es)?`))return;
    setSending(true);setStatus(`Sending ${codes.length} invitation(s)...`);
    try {
      const response=await fetch("/api/ambassador-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password,action:"send",codes,forceResend})});
      const data=await response.json();
      if(!response.ok&& !data.results)throw new Error(data.message||"Invitation delivery failed.");
      const byCode=new Map<string,string>((data.results||[]).map((result:{code:string;status:string})=>[result.code,result.status]));
      setPeople(current=>current.map(person=>{const result=byCode.get(person.code);return result==="sent"?{...person,invitation_status:"sent",invitation_sent_at:new Date().toISOString()}:result==="failed"?{...person,invitation_status:"failed"}:person}));
      setChecked(current=>current.filter(code=>byCode.get(code)==="failed"));
      setStatus(`${data.sent||0} sent, ${data.alreadySent||0} already delivered, ${data.failed||0} failed.`);
    } catch(error){setStatus(error instanceof Error?error.message:"Invitation delivery failed.");}
    finally{setSending(false)}
  }

  const allFilteredChecked=filtered.length>0&&filtered.every(person=>checked.includes(person.code));
  const toggleFiltered=()=>setChecked(current=>allFilteredChecked?current.filter(code=>!filtered.some(person=>person.code===code)):Array.from(new Set([...current,...filtered.map(person=>person.code)])));

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff6ef,transparent_35%),linear-gradient(135deg,#f8faf8,#f4ead4)] px-4 py-9 text-slate-800">
    <div className="mx-auto max-w-7xl">
      <section className="overflow-hidden rounded-[2rem] bg-[#073f37] text-white shadow-2xl">
        <div className="grid gap-7 px-7 py-9 md:grid-cols-[1fr_auto] md:items-center md:px-10">
          <div><p className="text-xs font-extrabold uppercase tracking-[.3em] text-amber-300">Official communication desk</p><h1 className="mt-3 text-3xl font-black md:text-5xl">Campus Ambassador Invitations</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50/75">Preview and deliver the official Construct Carnival 2.0 invitation to every campus ambassador.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"><ShieldCheck className="text-amber-300" size={35}/><p className="mt-2 text-sm font-bold">Protected delivery panel</p></div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur md:p-7">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]"><input ref={passwordInputRef} type="password" value={password} onChange={event=>setPassword(event.target.value)} onKeyDown={event=>event.key==="Enter"&&load()} placeholder="Admin password" className="rounded-xl border border-slate-200 px-4 py-3 outline-none ring-emerald-600 focus:ring-2"/><button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#073f37] px-6 py-3 font-bold text-white disabled:opacity-50">{loading?<Loader2 className="animate-spin" size={18}/>:<Database size={18}/>} Load ambassadors</button></div>
        {status&&<p className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">{status}</p>}
        {people.length>0&&<><div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-extrabold uppercase text-emerald-700">Total sent</p><p className="mt-1 text-3xl font-black text-emerald-900">{sentTotal}</p></div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5"><p className="text-xs font-extrabold uppercase text-red-700">Failed</p><p className="mt-1 text-3xl font-black text-red-900">{failedCodes.length}</p></div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-xs font-extrabold uppercase text-amber-700">Remaining</p><p className="mt-1 text-3xl font-black text-amber-900">{remainingTotal}</p></div>
        </div>
        {failedCodes.length>0&&<button onClick={()=>send(failedCodes)} disabled={sending} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-50"><RefreshCw size={18} className={sending?"animate-spin":""}/> Retry failed only ({failedCodes.length})</button>}</>}
      </section>

      {people.length>0&&<div className="mt-6 grid gap-6 lg:grid-cols-[390px_1fr]">
        <section className="rounded-3xl border bg-white p-5 shadow-xl">
          <div className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={18}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search name, code, email or campus" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm"/></div>
          <div className="mt-3 flex items-center justify-between text-xs"><button onClick={toggleFiltered} className="font-extrabold text-emerald-800">{allFilteredChecked?"Clear visible":"Select visible"}</button><span className="text-slate-500">{filtered.length} of {people.length}</span></div>
          <div className="mt-3 max-h-[590px] overflow-y-auto rounded-xl border">{filtered.map(person=><div key={person.code} className={`flex gap-3 border-b p-3 last:border-0 ${selected?.code===person.code?"bg-emerald-50":""}`}>
            <input type="checkbox" checked={checked.includes(person.code)} onChange={()=>setChecked(current=>current.includes(person.code)?current.filter(code=>code!==person.code):[...current,person.code])} className="mt-1 h-4 w-4 accent-emerald-700"/>
            <button onClick={()=>setSelectedCode(person.code)} className="min-w-0 flex-1 text-left"><span className="font-extrabold text-[#073f37]">{person.code} - {person.name}</span><span className="block truncate text-xs text-slate-500">{person.email}</span><span className="block truncate text-xs text-slate-400">{[person.department,person.university].filter(Boolean).join(", ")||"Campus Ambassador"}</span></button>
            {person.invitation_status==="sent"?<CheckCircle2 className="shrink-0 text-emerald-600" size={18}/>:person.invitation_status==="failed"?<XCircle className="shrink-0 text-red-600" size={18}/>:null}
          </div>)}</div>
          <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={forceResend} onChange={event=>setForceResend(event.target.checked)} className="h-4 w-4 accent-emerald-700"/> Resend invitations already delivered</label>
          <button onClick={()=>send(checked)} disabled={!checked.length||sending} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white disabled:opacity-50">{sending?<Loader2 className="animate-spin" size={18}/>:<Send size={18}/>} Send selected ({checked.length})</button>
        </section>

        <section className="overflow-hidden rounded-3xl border bg-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-5"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-700">Email preview</p><h2 className="mt-1 text-xl font-black">{selected?.name}</h2><p className="text-sm text-slate-500">{selected?.email}</p></div><button onClick={()=>selected&&send([selected.code])} disabled={!selected||sending} className="inline-flex items-center gap-2 rounded-xl bg-[#073f37] px-5 py-3 font-bold text-white disabled:opacity-50"><Mail size={17}/> Send this invitation</button></div>
          {selected&&<div className="bg-[#e9eee9] p-4 sm:p-8">
            <article className="mx-auto max-w-[680px] overflow-hidden border border-[#d5bd82] bg-[#fffdf7] shadow-2xl">
              <div className="h-2 bg-[#073f37]"/>
              <header className="border-b border-[#e2d3ad] px-6 py-8 text-center"><img src="/logo/blue-main_x1024.png" alt="Construct Carnival" className="mx-auto mb-4 h-auto w-28"/><p className="text-[11px] font-black uppercase tracking-[.32em] text-[#b08735]">Official Invitation</p><h3 className="mt-2 font-serif text-4xl text-[#073f37]">Construct Carnival 2.0</h3><p className="mt-2 text-[11px] tracking-[.15em] text-slate-500">BUILDING FUTURE, MANAGING REALITY</p></header>
              <div className="p-6 sm:p-9"><p className="font-serif text-xl font-bold text-[#073f37]">Dear {selected.name},</p><p className="mt-4 text-sm leading-7 text-slate-600">You are cordially invited to join Construct Carnival 2.0 as our valued <strong className="text-[#073f37]">Campus Ambassador</strong>. Your leadership helped connect this celebration with students across the country.</p>
                <div className="mt-6 grid bg-[#073f37] text-white sm:grid-cols-2"><div className="border-b border-amber-300/40 p-6 text-center sm:border-b-0 sm:border-r"><CalendarDays className="mx-auto mb-3 text-amber-300" size={24}/><p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Date & Time</p><p className="mt-1 font-serif text-lg">03 October 2026</p><p className="text-xs text-white/70">Saturday, from 8:00 AM</p></div><div className="p-6 text-center"><MapPin className="mx-auto mb-3 text-amber-300" size={20}/><p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Venue</p><p className="mt-1 font-serif text-lg">RUET Auditorium</p><p className="text-xs text-white/70">& Department of BECM</p></div></div>
                <div className="mx-auto mt-6 flex w-fit items-center border border-[#d6bd80] bg-[#faf5e8] px-5 py-3"><span className="mr-4 text-[10px] font-bold uppercase tracking-widest text-[#75633e]">Ambassador Code</span><strong className="font-serif text-2xl text-[#073f37]">{selected.code}</strong></div>
                <div className="mt-6 border-l-4 border-amber-500 bg-[#f7f2e6] p-4 text-justify text-sm leading-6 text-slate-600">Please keep your personal Ambassador QR codes ready for kit and lunch collection.</div>
              </div><footer className="bg-[#073f37] px-5 py-4 text-center text-[10px] uppercase tracking-[.2em] text-emerald-50">We look forward to welcoming you</footer>
            </article>
          </div>}
        </section>
      </div>}
    </div>
  </main>;
}
