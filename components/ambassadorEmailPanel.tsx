'use client';

import { useMemo, useState } from 'react';
import type { Ambassador } from '@/lib/ambassadors';

export default function AmbassadorEmailPanel() {
  const [password, setPassword] = useState('');
  const [items, setItems] = useState<Ambassador[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const subject = 'Congratulations! You\u2019re Selected as a \u201cCampus Ambassador\u201d for Construct Carnival 2.0';
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => !query || [item.code,item.name,item.email,item.university].some((value) => value.toLowerCase().includes(query)));
  }, [items, search]);

  async function unlock() {
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch('/api/ambassador-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, action: 'list' })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setItems(result.ambassadors);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to open mail console');
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!selected.length || !window.confirm(`Send an individual announcement email to ${selected.length} selected ambassador(s)?`)) return;
    setBusy(true); setStatus('Sending emails...');
    try {
      const response = await fetch('/api/ambassador-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, action: 'send', codes: selected }) });
      const result = await response.json();
      if (!response.ok && !result.sent) throw new Error(result.message);
      setStatus(`Sent: ${result.sent}. Failed: ${result.failed}.`);
      if (!result.failed) setSelected([]);
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Email sending failed'); }
    finally { setBusy(false); }
  }

  return <section className="mx-auto mb-20 w-[calc(100%-2rem)] max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl md:p-8">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><p className="text-xs font-bold uppercase tracking-[.25em] text-teal-600">Trial email tool</p><h1 className="mt-2 text-3xl font-extrabold text-[#073f37]">Campus Ambassador Email</h1><p className="mt-2 text-sm text-slate-500">Send the same selection announcement individually, personalized with each ambassador&apos;s name and code.</p></div>
      {!items.length && <div className="flex flex-col gap-2 sm:flex-row"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void unlock()} placeholder="Admin password" autoComplete="current-password" className="rounded-xl border border-slate-300 px-4 py-2" /><button type="button" onClick={unlock} disabled={busy || !password} className="rounded-xl bg-[#073f37] px-5 py-2 font-bold text-white disabled:opacity-50">{busy ? 'Checking...' : 'Open console'}</button></div>}
    </div>
    {status && <p className="mt-4 rounded-xl bg-slate-100 p-3 font-semibold text-slate-700" role="status">{status}</p>}
    {!!items.length && <>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase text-amber-700">Email subject</p><p className="mt-1 font-semibold text-slate-800">{subject}</p><p className="mt-2 text-sm text-slate-600">The body includes the supplied responsibilities, benefits, award, WhatsApp and registration links, plus the poster attachment.</p></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, code, email or university" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2" /><button type="button" onClick={() => setSelected(items.map(({code}) => code))} disabled={selected.length === items.length} className="rounded-xl border border-teal-700 px-4 py-2 font-bold text-teal-800 disabled:cursor-not-allowed disabled:opacity-50">Select all candidates</button><button type="button" onClick={() => setSelected([])} disabled={!selected.length} className="rounded-xl border border-slate-300 px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-50">Clear all</button></div>
      <p className="mt-3 text-sm font-bold text-teal-800">{selected.length} of {items.length} selected</p>
      <div className="mt-3 max-h-[32rem] overflow-auto rounded-xl border border-slate-200">
        {filtered.map((item) => <label key={item.code} className="grid cursor-pointer grid-cols-[auto_1fr] gap-3 border-b border-slate-100 p-3 hover:bg-teal-50 sm:grid-cols-[auto_80px_1fr_1fr]">
          <input type="checkbox" checked={selected.includes(item.code)} onChange={() => setSelected((current) => current.includes(item.code) ? current.filter((code) => code !== item.code) : [...current,item.code])} className="h-5 w-5" />
          <strong className="text-teal-800">{item.code}</strong><span><strong>{item.name}</strong>{(item.university || item.department) && <small className="block text-slate-500">{[item.university, item.department].filter(Boolean).join(' / ')}</small>}</span><span className="col-start-2 break-all text-sm text-slate-600 sm:col-start-auto">{item.email}</span>
        </label>)}
      </div>
      <button type="button" onClick={send} disabled={busy || !selected.length} className="mt-5 w-full rounded-xl bg-emerald-700 px-5 py-3 text-lg font-extrabold text-white hover:bg-emerald-800 disabled:opacity-50">{busy ? 'Sending...' : `Send ${selected.length || ''} individual email${selected.length === 1 ? '' : 's'}`}</button>
    </>}
  </section>;
}
