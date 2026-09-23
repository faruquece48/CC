'use client';
import { FormEvent, useCallback, useState } from "react";

type Person = { registration_id:number; cancelled_at:string; name:string; email:string; phonenumber:string; department:string; university:string; events:string[]; fee:number; was_paid:boolean };
type Team = { registration_id:number; cancelled_at:string; event:string; teamname:string; delivery_address:string; members:Array<{name?:string;email?:string}>; fee:number; was_paid:boolean };
type Preview = { registrationId:number; recipients:Array<{name:string;email:string}>; subject:string; html:string };

export default function CancelRegistrationPage() {
  const [password,setPassword]=useState("");
  const [id,setId]=useState("");
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [individual,setIndividual]=useState<Person[]>([]);
  const [teams,setTeams]=useState<Team[]>([]);
  const [preview,setPreview]=useState<Preview|null>(null);

  const call=useCallback(async(action:"list"|"preview"|"cancel"|"restore",registrationId?:number)=>{
    const response=await fetch("/api/registration-cancellations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,password,registrationId})});
    const data=await response.json();
    if(!response.ok) throw new Error(data.message||"Request failed");
    if(data.individual)setIndividual(data.individual); if(data.teams)setTeams(data.teams);
    return data;
  },[password]);

  async function login(event:FormEvent){
    event.preventDefault(); setBusy(true); setError("");
    try{await call("list");setReady(true)}catch(e){setError(e instanceof Error?e.message:"Unable to sign in")}finally{setBusy(false)}
  }
  async function cancel(event:FormEvent){
    event.preventDefault(); const registrationId=Number(id);
    if(!Number.isInteger(registrationId)||registrationId<=0){setError("Enter a valid registration ID.");return}
    setBusy(true);setError("");setMessage("");
    try{const data=await call("preview",registrationId);setPreview({registrationId,recipients:data.recipients,subject:data.subject,html:data.html})}catch(e){setPreview(null);setError(e instanceof Error?e.message:"Unable to preview cancellation")}finally{setBusy(false)}
  }
  async function confirmCancellation(){if(!preview)return;setBusy(true);setError("");setMessage("");try{const data=await call("cancel",preview.registrationId);setMessage(data.message);setId("");setPreview(null)}catch(e){setError(e instanceof Error?e.message:"Cancellation failed")}finally{setBusy(false)}}
  async function restoreRegistration(registrationId:number){if(!confirm(`Restore registration ${registrationId}? It will become active and appear on the participant pages again.`))return;setBusy(true);setError("");setMessage("");try{const data=await call("restore",registrationId);setMessage(data.message)}catch(e){setError(e instanceof Error?e.message:"Restore failed")}finally{setBusy(false)}}

  if(!ready)return <main className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4"><form onSubmit={login} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg"><h1 className="text-2xl font-bold">Registration Cancellation</h1><p className="mt-2 text-sm text-slate-600">Administrator access only.</p><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password" required className="mt-6 w-full rounded-lg border px-4 py-3"/><button disabled={busy} className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60">{busy?"Loading...":"Continue"}</button>{error&&<p className="mt-4 text-red-600">{error}</p>}</form></main>;

  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6">
    <h1 className="text-3xl font-bold">Cancel a Registration</h1>
    <p className="mt-2 text-slate-600">Canceled records remain here for audit but no longer work on any participant page.</p>
    <form onSubmit={cancel} className="mt-6 flex max-w-xl flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row"><input type="number" min="1" value={id} onChange={e=>{setId(e.target.value);setPreview(null)}} placeholder="Registration ID" required className="min-w-0 flex-1 rounded-lg border bg-white px-4 py-3"/><button disabled={busy} className="rounded-lg bg-red-700 px-6 py-3 font-semibold text-white disabled:opacity-60">{busy?"Working...":"Preview cancellation"}</button></form>
    {message&&<p className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700">{message}</p>}{error&&<p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    {preview&&<section className="mt-8 max-w-4xl overflow-hidden rounded-2xl border border-amber-200 bg-[#f8f5ee] shadow-xl"><div className="flex flex-col gap-4 border-b border-amber-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Email review</p><h2 className="mt-1 font-serif text-2xl font-semibold text-emerald-950">Cancellation notice preview</h2></div><span className="w-fit rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Not sent</span></div><div className="border-b border-amber-200 px-6 py-4 text-sm text-slate-700"><p><span className="inline-block w-16 font-semibold text-slate-500">To</span>{preview.recipients.map(r=>`${r.name} <${r.email}>`).join(", ")}</p><p className="mt-2"><span className="inline-block w-16 font-semibold text-slate-500">Subject</span>{preview.subject}</p></div><div className="bg-[#ebe5d8] p-3 sm:p-7"><div className="overflow-hidden rounded-lg shadow-sm" dangerouslySetInnerHTML={{__html:preview.html}}/></div><div className="flex flex-col-reverse gap-3 bg-white px-6 py-5 sm:flex-row sm:justify-end"><button type="button" onClick={()=>setPreview(null)} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Close preview</button><button type="button" disabled={busy} onClick={confirmCancellation} className="rounded-lg bg-red-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-800 disabled:opacity-60">{busy?"Canceling...":"Confirm cancellation"}</button></div></section>}
    <Table title="Canceled individual registrations" headers={["ID","Name","Email","Phone","Department","University","Events","Fee","Paid","Canceled"]} rows={individual.map(r=>[r.registration_id,r.name,r.email,r.phonenumber,r.department,r.university,r.events?.join(", "),`${r.fee||0} BDT`,r.was_paid?"Yes":"No",new Date(r.cancelled_at).toLocaleString()])} onRestore={restoreRegistration}/>
    <Table title="Canceled team registrations" headers={["ID","Event","Team","Members","Delivery address","Fee","Paid","Canceled"]} rows={teams.map(r=>[r.registration_id,r.event,r.teamname,r.members?.map(m=>`${m.name||"-"} (${m.email||"-"})`).join("; "),r.delivery_address||"-",`${r.fee||0} BDT`,r.was_paid?"Yes":"No",new Date(r.cancelled_at).toLocaleString()])} onRestore={restoreRegistration}/>
  </main>;
}

function Table({title,headers,rows,onRestore}:{title:string;headers:string[];rows:Array<Array<string|number|undefined>>;onRestore:(id:number)=>void}){
  return <section className="mt-10"><h2 className="text-xl font-bold">{title}</h2><div className="mt-3 overflow-x-auto rounded-xl border bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-900 text-white"><tr>{headers.map(h=><th key={h} className="whitespace-nowrap px-3 py-3">{h}</th>)}<th className="px-3 py-3 text-right">Action</th></tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={i} className="border-t even:bg-slate-50">{r.map((v,j)=><td key={j} className="max-w-xs px-3 py-3 align-top">{v||"-"}</td>)}<td className="px-3 py-3 text-right"><button type="button" onClick={()=>onRestore(Number(r[0]))} className="rounded bg-emerald-700 px-3 py-2 font-semibold text-white">Restore</button></td></tr>):<tr><td colSpan={headers.length+1} className="p-8 text-center text-slate-500">No canceled registrations.</td></tr>}</tbody></table></div></section>
}
