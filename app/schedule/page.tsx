import { Award, CalendarDays, Coffee, Cpu, MapPin, PackageCheck, Presentation, ShieldCheck, Sparkles, Trophy, UtensilsCrossed, Users, Wrench } from "lucide-react";

const morning = [
  { time: "8:00 AM — 9:00 AM", title: "Kit Collection & Participant Check-in", place: "RUET Auditorium", icon: PackageCheck, color: "from-sky-500 to-cyan-400" },
  { time: "9:00 AM — 9:30 AM", title: "Inauguration Ceremony", place: "RUET Auditorium", icon: Sparkles, color: "from-amber-500 to-orange-400" },
  { time: "9:30 AM — 11:00 AM", title: "Technical Workshop Session", place: "RUET Auditorium", icon: Wrench, color: "from-violet-500 to-fuchsia-400" },
  { time: "11:00 AM — 12:00 PM", title: "Sponsor Talk & Industry Insights", place: "RUET Auditorium", icon: Presentation, color: "from-emerald-500 to-teal-400" },
  { time: "12:30 PM — 1:00 PM", title: "Lunch Collection & Midday Break", place: "RUET Auditorium", icon: UtensilsCrossed, color: "from-rose-500 to-pink-400" },
];

const competitions = [
  { time: "2:30 PM — 3:10 PM", title: "CAD Expert", icon: Cpu },
  { time: "3:30 PM — 4:10 PM", title: "Mechamind", icon: Sparkles },
  { time: "4:30 PM — 5:10 PM", title: "Management Maestro", icon: Users },
  { time: "5:30 PM — 6:10 PM", title: "Truss Combat", icon: Wrench },
];

export default function SchedulePage() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#f3f7f6] text-[#12342f]">
      <section className="relative isolate mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-[#073f37] px-5 py-10 text-white shadow-xl md:px-8 md:py-12">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(45,212,191,.24),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(251,191,36,.22),transparent_24%)]" />
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.09)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute -bottom-36 -right-24 h-80 w-80 rounded-full border-[48px] border-white/5" />
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-extrabold leading-none tracking-tight sm:text-6xl md:text-7xl">Event <span className="text-amber-300">Schedule</span></h1>
          <div className="mt-7 flex w-full max-w-xl items-center gap-4" aria-hidden="true"><span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300/70" /><span className="h-2.5 w-2.5 rotate-45 border border-amber-200 bg-amber-300" /><span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300/70" /></div>
          <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:gap-5">
            <span className="text-xs font-extrabold uppercase tracking-[0.35em] text-teal-200">Official Event Day</span>
            <span className="hidden h-5 w-px bg-white/25 sm:block" />
            <div className="flex items-center gap-3"><CalendarDays className="text-amber-300" size={21} /><p className="text-base font-semibold uppercase tracking-[0.16em] text-white sm:text-lg"><span className="text-amber-300">Friday</span><span className="mx-2 text-white/35">·</span>02 October 2026</p></div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-8 max-w-6xl px-4 pb-20 md:mt-10 md:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-[0_24px_70px_rgba(7,63,55,.14)] backdrop-blur md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-600">Morning Session</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#073f37]">Kick-off & learning</h2></div>
            <span className="w-fit rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">Morning program</span>
          </div>
          <div className="relative space-y-4 before:absolute before:bottom-8 before:left-[27px] before:top-8 before:w-px before:bg-slate-200 md:before:left-[31px]">
            {morning.map((item) => { const Icon = item.icon; return (
              <article key={item.title} className="group relative grid grid-cols-[56px_1fr] items-center gap-4 rounded-2xl border border-slate-100 bg-[#fbfcfc] p-3 transition duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg md:grid-cols-[64px_210px_1fr_auto] md:p-4">
                <div className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md md:h-12 md:w-12`}><Icon size={21} /></div>
                <p className="text-sm font-extrabold text-[#073f37] md:text-base">{item.time}</p><h3 className="col-start-2 text-lg font-bold text-slate-800 md:col-start-auto md:translate-x-10 md:text-xl">{item.title}</h3><div className="col-start-2 flex items-center gap-1.5 text-sm text-slate-500 md:col-start-auto"><MapPin size={15} /> {item.place}</div>
              </article> ); })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[.82fr_1.18fr]">
          <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#102e5a] to-[#2855a0] p-7 text-white shadow-xl md:p-9">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[28px] border-white/5" />
            <div className="relative"><div className="mb-10 flex items-start justify-between"><div className="rounded-2xl bg-white/15 p-4"><Presentation size={28} /></div><span className="rounded-full bg-cyan-300 px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-950">Parallel Session</span></div><p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">9:30 AM — 12:30 PM</p><h2 className="mt-3 text-3xl font-extrabold">Poster Presentation</h2><p className="mt-4 flex items-center gap-2 text-white/70"><MapPin size={17} /> RUET Auditorium</p><p className="mt-8 border-t border-white/15 pt-6 text-sm leading-6 text-white/60">Runs alongside the workshop and sponsor talk.</p></div>
          </article>
          <div className="rounded-[2rem] border border-slate-200 bg-[#eaf1ef] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-600">Afternoon Arena</p><h2 className="mt-2 text-3xl font-extrabold text-[#073f37]">Competition rounds</h2></div><Trophy className="hidden text-orange-500 sm:block" size={36} /></div>
            <div className="grid gap-3 sm:grid-cols-2">{competitions.map((item, index) => { const Icon = item.icon; return <article key={item.title} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#073f37] text-amber-300"><Icon size={21} /></div><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Round {index + 1}</p><h3 className="text-lg font-extrabold text-slate-800">{item.title}</h3><p className="text-sm font-semibold text-teal-700">{item.time}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin size={12} /> Dept. of BECM, RUET</p></div></article>; })}</div>
          </div>
        </div>

        <article className="relative mt-6 overflow-hidden rounded-[2rem] bg-[#f5b72e] p-7 text-[#173b35] shadow-xl md:p-10"><div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle,rgba(7,63,55,.14)_2px,transparent_2px)] [background-size:18px_18px] md:block" /><div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center"><div className="flex items-center gap-5"><div className="rounded-2xl bg-[#073f37] p-4 text-amber-300"><Award size={32} /></div><div><p className="text-xs font-extrabold uppercase tracking-[0.2em]">Grand Finale</p><h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Prize Giving & Closing Ceremony</h2><p className="mt-2 flex items-center gap-1.5 text-sm font-semibold opacity-70"><MapPin size={15} /> RUET Auditorium</p></div></div><div className="rounded-2xl bg-white/55 px-6 py-4 text-center backdrop-blur"><p className="text-xs font-bold uppercase tracking-widest opacity-60">Evening</p><p className="mt-1 text-xl font-extrabold">7:00 PM — 8:15 PM</p></div></div></article>
        <article className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[2rem] border border-dashed border-teal-500/40 bg-teal-50 p-7 sm:flex-row sm:items-center md:p-9"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white p-4 text-teal-700 shadow-sm"><Coffee size={26} /></div><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-teal-600">Contingency</p><h2 className="mt-1 text-2xl font-extrabold text-[#073f37]">Reserved Day</h2></div></div><div className="text-left sm:text-right"><p className="text-2xl font-extrabold text-[#073f37]">03 October 2026</p><p className="mt-1 text-sm font-medium text-slate-500">Saturday · Kept free for contingency</p></div></article>

        <aside className="mt-6 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-5 text-left shadow-sm md:px-7" aria-label="Schedule notice">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#073f37] text-amber-300"><ShieldCheck size={21} /></div>
          <div><h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#073f37]">Schedule Notice</h2><p className="mt-1.5 text-sm leading-6 text-slate-600">The Event Organizing Committee reserves the right to modify, reschedule, or cancel any program when necessary. All decisions made by the committee regarding the event schedule shall be considered final.</p></div>
        </aside>
      </section>
    </main>
  );
}
