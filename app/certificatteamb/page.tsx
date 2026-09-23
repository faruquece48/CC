"use client";
import { Award, CheckCircle2, Download, Loader2, Mail, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Ambassador={code:string;name:string;email:string;university:string;department:string;certificate_sent:boolean;certificate_sent_at:string|null};
const passwordKey="ambassador-certificate-admin-password-v1";

export default function AmbassadorCertificatePage(){
  const [password,setPassword]=useState("");
  const [people,setPeople]=useState<Ambassador[]>([]);
  const [selectedCode,setSelectedCode]=useState("");
  const [checked,setChecked]=useState<string[]>([]);
  const [search,setSearch]=useState("");
  const [pdfUrl,setPdfUrl]=useState("");
  const [loading,setLoading]=useState(false);
  const [previewing,setPreviewing]=useState(false);
  const [sending,setSending]=useState(false);
  const [forceResend,setForceResend]=useState(false);
  const [status,setStatus]=useState("");
  const [failedCodes,setFailedCodes]=useState<string[]>([]);

  useEffect(()=>{try{setPassword(localStorage.getItem(passwordKey)||"")}catch{}},[]);
  const sentTotal=people.filter(person=>person.certificate_sent).length;
  const remainingTotal=Math.max(0,people.length-sentTotal);
  const selected=people.find(person=>person.code===selectedCode);
  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return !q?people:people.filter(p=>p.code.toLowerCase().includes(q)||p.name.toLowerCase().includes(q)||p.email.toLowerCase().includes(q)||p.university.toLowerCase().includes(q))},[people,search]);

  const load=async()=>{setLoading(true);setStatus("");try{try{localStorage.setItem(passwordKey,password)}catch{}const response=await fetch("/api/ambassador-certificate-participants",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to load ambassadors.");setPeople(data.ambassadors||[]);setChecked((data.ambassadors||[]).filter((p:Ambassador)=>!p.certificate_sent).map((p:Ambassador)=>p.code));if(data.ambassadors?.[0])setSelectedCode(data.ambassadors[0].code);setStatus(`${data.ambassadors?.length||0} campus ambassadors loaded.`)}catch(e){setStatus(e instanceof Error?e.message:"Unable to load ambassadors.")}finally{setLoading(false)}};

  useEffect(()=>{if(!selectedCode||!password)return;let active=true;setPreviewing(true);fetch("/api/ambassador-certificate-preview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password,code:selectedCode})}).then(async response=>{if(!response.ok){const data=await response.json().catch(()=>null);throw new Error(data?.message||"Unable to preview certificate.")}return response.blob()}).then(blob=>{if(!active)return;const url=URL.createObjectURL(blob);setPdfUrl(old=>{if(old)URL.revokeObjectURL(old);return url})}).catch(e=>active&&setStatus(e instanceof Error?e.message:"Preview failed.")).finally(()=>active&&setPreviewing(false));return()=>{active=false}},[selectedCode,password]);

  const send=async(codes:string[])=>{if(!codes.length||sending)return;if(!confirm(`Send ambassador certificates to ${codes.length} email address(es)?`))return;setSending(true);let sent=0,skipped=0,failed=0;const nextFailed=new Set(failedCodes.filter(code=>!codes.includes(code)));for(let i=0;i<codes.length;i++){setStatus(`Sending ${i+1} of ${codes.length}...`);try{const response=await fetch("/api/send-ambassador-certificate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password,code:codes[i],forceResend})});const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||"Delivery failed.");if(data.alreadySent)skipped++;else sent++;nextFailed.delete(codes[i]);setPeople(current=>current.map(p=>p.code===codes[i]?{...p,certificate_sent:true,certificate_sent_at:new Date().toISOString()}:p))}catch{failed++;nextFailed.add(codes[i])}}setFailedCodes(Array.from(nextFailed));setStatus(`${sent} sent, ${skipped} already sent, ${failed} failed.`);setSending(false)};

  const download=()=>{if(!pdfUrl||!selected)return;const a=document.createElement("a");a.href=pdfUrl;a.download=`${selected.code}-campus-ambassador-certificate.pdf`;a.click()};

  return <main className="min-h-screen bg-[#edf3f1] px-4 py-10 text-slate-800 sm:px-6">
    <section className="mx-auto max-w-7xl">
      <header className="overflow-hidden rounded-3xl bg-[#0b2e3d] px-6 py-8 text-white shadow-xl sm:px-9">
        <div className="flex items-center gap-4"><div className="rounded-2xl border border-amber-300/50 bg-white/10 p-3 text-amber-300"><Award size={32}/></div><div><p className="text-xs font-extrabold uppercase tracking-[.25em] text-amber-300">Construct Carnival 2.0</p><h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">Campus Ambassador Certificates</h1><p className="mt-2 text-sm text-slate-200">Preview, download, and email Certificates of Appreciation to the official ambassador team.</p></div></div>
      </header>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password" className="rounded-xl border px-4 py-3"/><button onClick={load} disabled={!password||loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087f78] px-5 py-3 font-bold text-white disabled:opacity-50">{loading?<Loader2 className="animate-spin" size={18}/>:<Award size={18}/>} Load ambassadors</button></div>
        {status&&<p className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900">{status}</p>}
      </section>

      {people.length>0&&<div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-extrabold uppercase text-emerald-700">Total sent</p><p className="mt-1 text-3xl font-black text-emerald-900">{sentTotal}</p></div><div className="rounded-2xl border border-red-200 bg-red-50 p-5"><p className="text-xs font-extrabold uppercase text-red-700">Failed</p><p className="mt-1 text-3xl font-black text-red-900">{failedCodes.length}</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-extrabold uppercase text-slate-600">Remaining</p><p className="mt-1 text-3xl font-black text-slate-900">{remainingTotal}</p></div></div>}
      {failedCodes.length>0&&<button onClick={()=>send(failedCodes)} disabled={sending} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-50">{sending?<Loader2 className="animate-spin" size={18}/>:<Mail size={18}/>} Retry failed emails ({failedCodes.length})</button>}
      {people.length>0&&<div className="mt-6 grid gap-6 lg:grid-cols-[390px_1fr]">
        <aside className="rounded-2xl border bg-white p-5 shadow-sm">
          <label className="flex items-center gap-2 text-sm font-bold"><Search size={16}/> Search ambassadors</label><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Code, name, email, university..." className="mt-2 w-full rounded-xl border px-4 py-3"/>
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>setChecked(filtered.map(p=>p.code))} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold">Select visible</button><button onClick={()=>setChecked([])} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold">Clear</button><span className="ml-auto self-center text-xs font-bold text-slate-500">{checked.length} selected</span></div>
          <div className="mt-3 max-h-[520px] overflow-y-auto rounded-xl border">{filtered.map(person=><div key={person.code} className={`flex gap-3 border-b p-3 last:border-0 ${selectedCode===person.code?"bg-teal-50":""}`}><input type="checkbox" checked={checked.includes(person.code)} onChange={()=>setChecked(current=>current.includes(person.code)?current.filter(code=>code!==person.code):[...current,person.code])} className="mt-1 h-4 w-4 accent-teal-700"/><button onClick={()=>setSelectedCode(person.code)} className="min-w-0 flex-1 text-left"><span className="font-extrabold text-teal-900">{person.code}  -  {person.name}</span><span className="block truncate text-xs text-slate-500">{person.email}</span><span className="block truncate text-xs text-slate-400">{[person.department,person.university].filter(Boolean).join(", ")||"Campus Ambassador"}</span></button>{person.certificate_sent&&<CheckCircle2 className="shrink-0 text-emerald-600" size={18}/>}</div>)}</div>
          <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={forceResend} onChange={e=>setForceResend(e.target.checked)} className="h-4 w-4 accent-teal-700"/> Resend certificates already delivered</label>
          <button onClick={()=>send(checked)} disabled={!checked.length||sending} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-white disabled:opacity-50">{sending?<Loader2 className="animate-spin" size={18}/>:<Send size={18}/>} Email selected ({checked.length})</button>
        </aside>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-teal-700">Certificate of Appreciation</p><h2 className="mt-1 text-xl font-extrabold">{selected?selected.name:"Select an ambassador"}</h2>{selected&&<p className="text-sm text-slate-500">{selected.code}  -  {selected.email}</p>}</div><div className="flex gap-2"><button onClick={download} disabled={!pdfUrl} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold disabled:opacity-50"><Download size={16}/> Download</button><button onClick={()=>selected&&send([selected.code])} disabled={!selected||sending} className="inline-flex items-center gap-2 rounded-lg bg-[#087f78] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Mail size={16}/> Email</button></div></div>
          <div className="mt-5 aspect-[1.414/1] overflow-hidden rounded-xl border bg-slate-100">{previewing?<div className="grid h-full place-items-center"><Loader2 className="animate-spin text-teal-700" size={36}/></div>:pdfUrl?<iframe src={`${pdfUrl}#page=1&view=Fit`} title="Campus ambassador certificate preview" className="h-full w-full"/>:<div className="grid h-full place-items-center text-slate-500">Select an ambassador to preview the certificate.</div>}</div>
        </section>
      </div>}
    </section>
  </main>
}
