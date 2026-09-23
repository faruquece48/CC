import Link from "next/link";
import { ArrowUpRight, Award, CalendarClock, CreditCard, FileText, FolderKey, Info, Mail, QrCode, ShieldCheck, Users } from "lucide-react";

type PageLink = { href: string; title: string; description: string };
type PageGroup = { title: string; description: string; icon: typeof Info; links: PageLink[] };

const groups: PageGroup[] = [
  {
    title: "Administration & communication",
    description: "Protected working pages used to manage participants and official communication.",
    icon: FolderKey,
    links: [
      { href: "/amb", title: "Ambassador invitations", description: "Preview, send, track, and retry campus ambassador invitations." },
      { href: "/message", title: "Participant messages", description: "Send announcements and schedule information to participants." },
      { href: "/cancelreg", title: "Registration cancellation", description: "Preview, cancel, audit, or restore registrations." },
      { href: "/registration_data", title: "Registration data", description: "Review the complete registration database and participant records." },
    ],
  },
  {
    title: "QR code operations",
    description: "Generate, distribute, verify, and scan kit and lunch QR codes.",
    icon: QrCode,
    links: [
      { href: "/qr", title: "QR generation and email", description: "Generate participant QR codes, preview emails, and track delivery." },
      { href: "/qrcheck", title: "QR scanner", description: "Main QR scanning and collection verification entry page." },
      { href: "/qrkit", title: "Kit collection scanner", description: "Scan and record kit collection QR codes." },
      { href: "/qrlunch", title: "Lunch collection scanner", description: "Scan and record lunch collection QR codes." },
      { href: "/qr/verify", title: "QR verification result", description: "Public result page opened when a participant QR is verified." },
    ],
  },
  {
    title: "Certificates",
    description: "Prepare, deliver, and verify participant and ambassador certificates.",
    icon: Award,
    links: [
      { href: "/certificatte", title: "Participant certificates", description: "Preview, download, email, and track participation certificates." },
      { href: "/certificatte/verify", title: "Participant certificate verification", description: "Verify a participation certificate using its signed QR code." },
      { href: "/certificatteamb", title: "Ambassador certificates", description: "Preview, download, email, and track ambassador certificates." },
      { href: "/certificatteamb/verify", title: "Ambassador certificate verification", description: "Verify a campus ambassador certificate using its QR code." },
    ],
  },
  {
    title: "Registration & payment utilities",
    description: "Supporting pages for registration, payment, and transaction outcomes.",
    icon: CreditCard,
    links: [
      { href: "/payment-slip-preview", title: "Payment slip preview", description: "Preview and download a registration payment slip." },
      { href: "/verify-payment", title: "Payment verification", description: "Check and verify a registration payment." },
      { href: "/registration-test", title: "Registration test", description: "Test version of the registration workflow." },
      { href: "/success", title: "Payment success", description: "Successful payment and registration result page." },
      { href: "/fail", title: "Payment failure", description: "Failed or cancelled payment result page." },
      { href: "/cancel", title: "Payment cancellation", description: "Payment-session cancellation result page." },
    ],
  },
  {
    title: "Event information",
    description: "Additional information pages that are not linked in the main navigation.",
    icon: CalendarClock,
    links: [
      { href: "/about", title: "About Construct Carnival", description: "Background and purpose of Construct Carnival." },
      { href: "/about-becm", title: "About BECM", description: "Information about the Department of BECM at RUET." },
      { href: "/alumni", title: "Alumni", description: "Alumni information and related event participation." },
      { href: "/important_dates", title: "Important dates", description: "Key deadlines and important event dates." },
      { href: "/program_schedule", title: "Program schedule", description: "Alternate program-schedule information page." },
      { href: "/workshop-highlights", title: "Workshop highlights", description: "Highlights and media from workshop activities." },
      { href: "/events-experience", title: "Event experience", description: "Event-experience and highlight content." },
      { href: "/message-from-head", title: "Message from the Head", description: "Official message from the department head." },
      { href: "/support", title: "Support", description: "Help and support information for visitors and participants." },
      { href: "/blog", title: "Blog", description: "Event news and blog content." },
    ],
  },
  {
    title: "Committee pages",
    description: "Committee information not currently exposed in the navigation bar.",
    icon: Users,
    links: [
      { href: "/committee/organizing", title: "Organizing committee", description: "Members of the Construct Carnival organizing committee." },
      { href: "/committee/technical", title: "Technical committee", description: "Technical committee information." },
    ],
  },
  {
    title: "Utility & legacy pages",
    description: "Existing project routes retained for internal or legacy use.",
    icon: FileText,
    links: [
      { href: "/ss", title: "SS utility page", description: "Existing internal utility or legacy page." },
      { href: "/sss", title: "SSS utility page", description: "Existing internal utility or legacy page." },
    ],
  },
];

export default function PageDirectory() {
  const total = groups.reduce((sum, group) => sum + group.links.length, 0);
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9f3ea,transparent_34%),linear-gradient(145deg,#f8faf8,#f5ead2)] px-4 py-10 text-slate-800">
    <div className="mx-auto max-w-6xl">
      <header className="overflow-hidden rounded-[2rem] bg-[#073f37] px-7 py-10 text-white shadow-2xl md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="text-xs font-extrabold uppercase tracking-[.28em] text-amber-300">Internal page directory</p><h1 className="mt-3 text-4xl font-black md:text-5xl">Available Page Links</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/75">A quick reference for every existing page that is not included in the main navigation bar.</p></div>
          <div className="w-fit rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur"><p className="text-3xl font-black text-amber-300">{total}</p><p className="text-xs font-bold uppercase tracking-wider text-white/70">Unlisted routes</p></div>
        </div>
      </header>

      <div className="mt-7 space-y-6">
        {groups.map(group => {
          const Icon = group.icon;
          return <section key={group.title} className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-lg backdrop-blur md:p-7">
            <div className="flex items-start gap-4"><div className="rounded-2xl bg-[#073f37] p-3 text-amber-300"><Icon size={23}/></div><div><h2 className="text-xl font-black text-[#073f37]">{group.title}</h2><p className="mt-1 text-sm text-slate-500">{group.description}</p></div></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {group.links.map(link => <Link key={link.href} href={link.href} className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md">
                <div className="min-w-0"><h3 className="font-extrabold text-slate-800 group-hover:text-emerald-800">{link.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{link.description}</p><code className="mt-2 inline-block rounded bg-slate-100 px-2 py-1 text-xs font-bold text-emerald-800">{link.href}</code></div>
                <ArrowUpRight className="mt-1 shrink-0 text-slate-400 transition group-hover:text-emerald-700" size={19}/>
              </Link>)}
            </div>
          </section>;
        })}
      </div>
      <aside className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><ShieldCheck className="mt-0.5 shrink-0" size={20}/><p>This directory is intentionally not included in the site navigation. Administrative pages still require their normal passwords or permissions.</p></aside>
    </div>
  </main>;
}
