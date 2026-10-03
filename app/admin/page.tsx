"use client";
import {FormEvent,useEffect,useRef,useState} from "react";
type Setup={id:number;name:string;weightKg:number};
type Result={registrationId:number;teamName:string;trussWeightGrams:number|null;setupNumber:number|null;addedLoadKg:number|null;appliedLoadKg:number|null;efficiency:number|null};
type Data={setups:Setup[];results:Result[]};
const input="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-teal-600";
export default function LoadingAdminPage(){
 const[password,setPassword]=useState(""),[data,setData]=useState<Data|null>(null),[error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(""),[resultSearch,setResultSearch]=useState("");
 const dirtySetups=useRef(false),dirtyResults=useRef(new Set<number>()),mutationPending=useRef(false),requestVersion=useRef(0),appliedVersion=useRef(0);
 async function request(body:Record<string,unknown>){
  const mutation=body.action!=="load";
  if(mutationPending.current){if(!mutation)return;throw Error("A save is already in progress.")}
  if(mutation)mutationPending.current=true;
  const version=++requestVersion.current;
  if(mutation)appliedVersion.current=version;
  try{
   const r=await fetch("/api/loading-admin",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({password,...body})}),j=await r.json();
   if(!r.ok)throw Error(j.message||"Request failed.");
   if(mutation){
    const rounded=(value:unknown)=>Number(Number(value).toFixed(3));
    if(j.success!==true)throw Error("The server did not confirm the save.");
    if(body.action==="save-setups"&&!(body.setups as Setup[]).every(setup=>j.setups?.some((saved:Setup)=>saved.id===setup.id&&saved.weightKg===rounded(setup.weightKg))))throw Error("The database returned different setup weights. Please try saving again.");
    if(body.action==="save-result"){
     const saved=j.results?.find((row:Result)=>row.registrationId===body.registrationId);
     if(!saved||saved.trussWeightGrams!==rounded(body.trussWeightGrams)||saved.setupNumber!==body.setupNumber||saved.addedLoadKg!==rounded(body.addedLoadKg))throw Error("The database returned different result values. Please try saving again.");
    }
   }
   if(version<appliedVersion.current)return j;
   appliedVersion.current=version;
   if(body.action==="save-setups")dirtySetups.current=false;
   if(body.action==="save-result")dirtyResults.current.delete(Number(body.registrationId));
   setData(old=>({...j,setups:old&&dirtySetups.current?old.setups:j.setups,results:j.results.map((row:Result)=>dirtyResults.current.has(row.registrationId)?old?.results.find(existing=>existing.registrationId===row.registrationId)??row:row)}));
   return j;
  }finally{if(mutation)mutationPending.current=false}
 }
 const authenticated=data!==null;
 useEffect(()=>{if(!authenticated)return;const timer=window.setInterval(()=>{void request({action:"load"}).catch(()=>undefined)},1000);return()=>window.clearInterval(timer)},[authenticated,password]);
 async function login(e:FormEvent){e.preventDefault();setBusy("login");setError("");try{await request({action:"load"})}catch(e){setError(e instanceof Error?e.message:"Unable to sign in.")}finally{setBusy("")}}
 async function saveSetups(){if(!data)return;setBusy("setups");setError("");setNotice("");try{await request({action:"save-setups",setups:data.setups});setNotice("All four fixed loading weights were saved. Live results have been recalculated.")}catch(e){setError(e instanceof Error?e.message:"Unable to save.")}finally{setBusy("")}}
 async function saveResult(row:Result){setBusy("result-"+row.registrationId);setError("");setNotice("");try{await request({action:"save-result",registrationId:row.registrationId,trussWeightGrams:row.trussWeightGrams,setupNumber:row.setupNumber,addedLoadKg:row.addedLoadKg});setNotice("Result "+row.registrationId+" was corrected.")}catch(e){setError(e instanceof Error?e.message:"Unable to save.")}finally{setBusy("")}}
 function changeResult(id:number,key:keyof Result,value:number){dirtyResults.current.add(id);setData(old=>old?{...old,results:old.results.map(r=>r.registrationId===id?{...r,[key]:value}:r)}:old)}
 const visibleResults=(data?.results||[]).filter(row=>String(row.registrationId).includes(resultSearch.trim()));
 if(!data)return <main className="min-h-[75vh] bg-[#f3f7f6] px-4 py-16"><form onSubmit={login} className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-bold uppercase tracking-[.25em] text-teal-700">Restricted access</p><h1 className="mt-2 text-3xl font-black text-slate-900">Loading Administration</h1><label className="mt-6 block text-sm font-bold text-slate-700">Password</label><input type="password" required autoFocus value={password} onChange={e=>setPassword(e.target.value)} className={input+" mt-2 w-full"} /><button disabled={!!busy} className="mt-5 w-full rounded-lg bg-[#073f37] px-4 py-3 font-bold text-white disabled:opacity-50">{busy?"Checking...":"Open admin page"}</button>{error&&<p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}</form></main>;
 return <main className="min-h-screen bg-[#f3f7f6] px-4 py-10 text-slate-800 sm:px-6"><div className="mx-auto max-w-7xl"><h1 className="text-4xl font-black">Loading Administration</h1><p className="mt-2 text-slate-600">Manage fixed apparatus weights and correct accidental result entries.</p>
 {error&&<p className="mt-5 rounded-xl bg-red-50 p-4 font-semibold text-red-700">{error}</p>}{notice&&<p className="mt-5 rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-700">{notice}</p>}
 <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-2xl font-black">Fixed loading weights</h2><p className="text-sm text-slate-500">Changing a weight recalculates every result using that setup.</p></div><button onClick={()=>void saveSetups()} disabled={!!busy} className="rounded-lg bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy==="setups"?"Saving...":"Save fixed loads"}</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.setups.map((s,i)=><label key={s.id} className="rounded-xl bg-slate-50 p-4 font-bold">{s.name}<span className="mt-3 flex items-center gap-2"><input type="number" min=".001" step=".001" value={s.weightKg} disabled={!!busy} onChange={e=>{dirtySetups.current=true;setData(old=>old?{...old,setups:old.setups.map((x,n)=>n===i?{...x,weightKg:Number(e.target.value)}:x)}:old)}} className={input+" min-w-0 w-full"}/> kg</span></label>)}</div></section>
 <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-black">Edit live results</h2><p className="text-sm text-slate-500">Only teams with an existing loading entry appear here.</p></div><label className="ml-auto w-full max-w-sm self-start text-sm font-bold text-slate-700">Find registration ID<input type="search" inputMode="numeric" value={resultSearch} onChange={e=>setResultSearch(e.target.value.replace(/\D/g,""))} placeholder="Type registration ID" className={input+" mt-2 w-full"}/></label></div></div><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-slate-100 text-xs uppercase text-slate-600"><tr><th scope="col" className="p-3">SL No.</th><th className="p-3">Registration ID</th><th className="p-3">Team</th><th className="p-3">Truss weight (gm)</th><th className="p-3">Setup</th><th className="p-3">Added load (kg)</th><th className="p-3">Total load (kg)</th><th className="p-3">Efficiency</th><th className="p-3">Action</th></tr></thead><tbody>{visibleResults.map((r,index)=><tr key={r.registrationId} className="border-t border-slate-200"><td className="p-3 font-semibold">{index+1}</td><td className="p-3 font-black text-teal-700">{r.registrationId}</td><td className="p-3 font-semibold">{r.teamName}</td><td className="p-3"><input type="number" min=".001" step=".001" value={r.trussWeightGrams??""} disabled={!!busy} onChange={e=>changeResult(r.registrationId,"trussWeightGrams",Number(e.target.value))} className={input+" w-28"}/></td><td className="p-3"><select value={r.setupNumber??""} disabled={!!busy} onChange={e=>changeResult(r.registrationId,"setupNumber",Number(e.target.value))} className={input}>{data.setups.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></td><td className="p-3"><input type="number" min="0" step=".001" value={r.addedLoadKg??""} disabled={!!busy} onChange={e=>changeResult(r.registrationId,"addedLoadKg",Number(e.target.value))} className={input+" w-28"}/></td><td className="p-3 font-mono">{r.appliedLoadKg?.toFixed(3)??"—"}</td><td className="p-3 font-mono font-bold text-emerald-700">{r.efficiency?.toFixed(8)??"—"}</td><td className="p-3"><button onClick={()=>void saveResult(r)} disabled={!!busy} className="rounded-lg bg-[#073f37] px-4 py-2 font-bold text-white disabled:opacity-50">{busy==="result-"+r.registrationId?"Saving...":"Save correction"}</button></td></tr>)}</tbody></table>{!visibleResults.length&&<p className="p-8 text-center text-slate-500">{resultSearch?"No result matches this registration ID.":"No loading results have been entered yet."}</p>}</div></section>
 </div></main>
}