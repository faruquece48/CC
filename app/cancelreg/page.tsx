'use client';
import { FormEvent, useCallback, useState } from "react";

type Person = { registration_id:number; cancelled_at:string; name:string; email:string; phonenumber:string; department:string; university:string; events:string[]; fee:number; was_paid:boolean };
type Team = { registration_id:number; cancelled_at:string; event:string; teamname:string; delivery_address:string; members:Array<{name?:string;email?:string}>; fee:number; was_paid:boolean };

export default function CancelRegistrationPage() {
  const [password,setPassword]=useState("");
  const [id,setId]=useState("");
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [individual,setIndividual]=useState<Person[]>([]);
  const [teams,setTeams]=useState<Team[]>([]);

  const call=useCallback(async(action:"list"|"cancel",registrationId?:number)=>{
    const response=await fetch("/api/registration-cancellations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,password,registrationId})});
    const data=await response.json();
    if(!response.ok) throw new Error(data.message||"Request failed");
    setIndividual(data.individual||[]); setTeams(data.teams||[]);
    return data;
  },[password]);

  async function login(event:FormEvent){
    event.preventDefault(); setBusy(true); setError("");
    try{await call("list");setReady(true)}catch(e){setError(e instanceof Error?e.message:"Unable to sign in")}finally{setBusy(false)}
  }
  async function cancel(event:FormEvent){
    event.preventDefault(); const registrationId=Number(id);
    if(!Number.isInteger(registrationId)||registrationId<=0){setError("Enter a valid registration ID.");return}
    if(!confirm(`Cancel registration ${registrationId}? This permanently removes all active registration, QR, kit, lunch, payment-slip and certificate data.`))return;
    setBusy(true);setError("");setMessage("");
    try{const data=await call("cancel",registrationId);setMessage(data.message);setId("")}catch(e){setError(e instanceof Error?e.message:"Cancellation failed")}finally{setBusy(false)}
  }

  if(!ready)return <main className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4"><form onSubmit={login} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg"><h1 className="text-2xl font-bold">Registration Cancellation</h1><p className="mt-2 text-sm text-slate-600">Administrator access only.</p><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Admin password" required className="mt-6 w-full rounded-lg border px-4 py-3"/><button disabled={busy} className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60">{busy?"Loading...":"Continue"}</button>{error&&<p className="mt-4 text-red-600">{error}</p>}</form></main>;

  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6">
    <h1 className="text-3xl font-bold">Cancel a Registration</h1>
    <p className="mt-2 text-slate-600">Canceled records remain here for audit but no longer work on any participant page.</p>
    <form onSubmit={cancel} className="mt-6 flex max-w-xl flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row"><input type="number" min="1" value={id} onChange={e=>setId(e.target.value)} placeholder="Registration ID" required className="min-w-0 flex-1 rounded-lg border bg-white px-4 py-3"/><button disabled={busy} className="rounded-lg bg-red-700 px-6 py-3 font-semibold text-white disabled:opacity-60">{busy?"Working...":"Cancel registration"}</button></form>
    {message&&<p className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700">{message}</p>}{error&&<p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    <Table title="Canceled individual registrations" headers={["ID","Name","Email","Phone","Department","University","Events","Fee","Paid","Canceled"]} rows={individual.map(r=>[r.registration_id,r.name,r.email,r.phonenumber,r.department,r.university,r.events?.join(", "),`${r.fee||0} BDT`,r.was_paid?"Yes":"No",new Date(r.cancelled_at).toLocaleString()])}/>
    <Table title="Canceled team registrations" headers={["ID","Event","Team","Members","Delivery address","Fee","Paid","Canceled"]} rows={teams.map(r=>[r.registration_id,r.event,r.teamname,r.members?.map(m=>`${m.name||"-"} (${m.email||"-"})`).join("; "),r.delivery_address||"-",`${r.fee||0} BDT`,r.was_paid?"Yes":"No",new Date(r.cancelled_at).toLocaleString()])}/>
  </main>;
}

function Table({title,headers,rows}:{title:string;headers:string[];rows:Array<Array<string|number|undefined>>}){
  return <section className="mt-10"><h2 className="text-xl font-bold">{title}</h2><div className="mt-3 overflow-x-auto rounded-xl border bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-900 text-white"><tr>{headers.map(h=><th key={h} className="whitespace-nowrap px-3 py-3">{h}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={i} className="border-t even:bg-slate-50">{r.map((v,j)=><td key={j} className="max-w-xs px-3 py-3 align-top">{v||"-"}</td>)}</tr>):<tr><td colSpan={headers.length} className="p-8 text-center text-slate-500">No canceled registrations.</td></tr>}</tbody></table></div></section>
}
