import Image from "next/image";
import Link from "next/link";
import { mediaAsset } from "@/config/assets";
import FeaturedVideo from "@/components/featuredVideo";
import {
  ArrowUpRight,
  Megaphone,
  Newspaper,
} from "lucide-react";

const facebookUrl = "https://www.facebook.com/profile.php?id=61567513587222";
const featuredVideoUrl = mediaAsset("CC.mp4");
const samakalArticleUrl =
  "https://samakal.com/rajshahi/article/371302/%E0%A6%B0%E0%A7%81%E0%A7%9F%E0%A7%87%E0%A6%9F%E0%A7%87-%E0%A6%B6%E0%A7%81%E0%A6%B0%E0%A7%81-%E0%A6%B9%E0%A6%9A%E0%A7%8D%E0%A6%9B%E0%A7%87-%E2%80%98%E0%A6%95%E0%A6%A8%E0%A6%B8%E0%A7%8D%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%95%E0%A7%8D%E0%A6%9F-%E0%A6%95%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A8%E0%A6%BF%E0%A6%AD%E0%A6%BE%E0%A6%B2-%E0%A7%A8-%E0%A7%A6%E2%80%99";

const promotionPosts = [
  { title: "Berger Fosroc joins as Silver Sponsor of Construct Carnival 2.0", date: "September 2026", image: "/media/facebook-post-9.jpg", publisher: "BECM Club, RUET", href: "https://www.facebook.com/share/p/1CWrSjzkf3/" },
  { title: "Akij Ceramics joins as Title Sponsor of Construct Carnival 2.0", date: "September 2026", image: "/media/facebook-post-8.jpg", publisher: "BECM Club, RUET", href: "https://www.facebook.com/becmclubruet/posts/pfbid0PkDdYMT1NbtquGhuG89kVejQBuPKryKbGaAMncUqcNMTwkbQdcS2uTWraNNNT1Vul" },
  { title: "Campus Ambassador recruitment across Bangladesh", date: "September 2026", image: "/media/facebook-post-1.jpg", publisher: "Construct Carnival", href: "https://www.facebook.com/permalink.php?story_fbid=pfbid0F921sVGz7k1GZYD8t8rywerqFseoGa6KkmvabGrUoejrNvpJgmm6BSDVA6jSLxNXl&id=61567513587222" },
  { title: "Celebrating the Best Campus Ambassador", date: "September 2026", image: "/media/facebook-post-2.jpg", publisher: "BECM Club, RUET", href: "https://www.facebook.com/becmclubruet/posts/pfbid0BZxQ5EJHvkFZMY3Lvg77mbQ8oEdduVov6LRidXVTFUYC34ySoK7xhKCGpsv7Tpz7l" },
  { title: "Meet our Campus Ambassadors", date: "September 2026", image: "/media/facebook-post-3.jpg", publisher: "BECM Club, RUET", href: "https://www.facebook.com/becmclubruet/posts/pfbid0FT9TytvUPDBVq6B1dFprDhfKbVHGyVgyBxFkXyqMrvD5UabobUPDuFmzeSRGbCuzl" },
  { title: "Only three days left to become a Campus Ambassador", date: "September 2026", image: "/media/facebook-post-4.jpg", publisher: "BECM Club, RUET", href: "https://www.facebook.com/becmclubruet/posts/pfbid02SvEefPdzQLVxPPDdfixKHixrmAPyFbZuZfCoG5eNTAEi4vDwxJiLUZMxBMMuSSWDl" },
  { title: "Construct Carnival 2.0 returns as a national engineering festival", date: "September 2026", image: "/media/facebook-post-5.jpg", publisher: "BECM Club, RUET", href: "https://www.facebook.com/becmclubruet/posts/pfbid02xr8WuZWazowx6cBuhyUmYga7GCCAowKwLiruWGeUKa2N2CVYen1T17DK3Yneo3RVl" },
  { title: "BECM Club RUET invites Campus Ambassadors", date: "September 2026", image: "/media/facebook-post-6.jpg", publisher: "BECM Club, RUET", href: "https://www.facebook.com/becmclubruet/posts/pfbid0D8pU15stAjWMRZXFd27MZh4QRxdoA1JxcKmcKza4LugutCJnoUNpu83Hh8CViW35l" },
  { title: "The biggest event of the year is knocking at the door", date: "September 2026", image: "/media/facebook-post-7.jpg", publisher: "BECM Club, RUET", href: "https://www.facebook.com/becmclubruet/posts/pfbid02iF6YSS9UiyKwLqWT1BqDudYrPE16eYB8kc7XjgCTHHETVytvMKo5krtqVUxk4nPel" },
];
export default function MediaPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f8fb] text-slate-900">
      <section className="px-4 pb-2 pt-6 md:pt-8">
        <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-[#075f57] via-[#0a554d] to-[#304c2f] px-5 py-10 text-center text-white shadow-[0_18px_45px_-22px_rgba(5,70,62,0.7)] md:py-12">
          <div className="absolute inset-0 -z-20 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:65px_65px]" />
          <div className="absolute -bottom-36 -right-16 -z-10 h-72 w-72 rounded-full border-[38px] border-white/[0.05]" />
          <h1 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl md:text-6xl">
            Media <span className="text-[#ffd447]">Coverage</span>
          </h1>
          <div className="mx-auto mt-5 flex max-w-xl items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#ffd447]/70" />
            <span className="h-2.5 w-2.5 rotate-45 bg-[#ffd447]" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ffd447]/70" />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-extrabold uppercase tracking-[0.3em] text-cyan-100 sm:text-sm">
            <span>News</span><span className="text-[#ffd447]">•</span>
            <span>Video</span><span className="text-[#ffd447]">•</span>
            <span>Article</span>
          </div>
        </div>
      </section>
      <section id="featured-video" className="relative mx-auto mt-10 max-w-6xl scroll-mt-24 px-4 md:mt-14">
        <div className="overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_-35px_rgba(8,59,102,0.65)]">
          <FeaturedVideo src={featuredVideoUrl} />

          <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center md:px-8 md:py-6">
            <div>
              <h2 className="text-xl font-black text-[#083b66] md:text-2xl">
                Construct Carnival 2.0
              </h2>
              <p className="mt-1 text-sm text-slate-600">Watch the official program highlight.</p>
            </div>
            <Link
              href={featuredVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#1877f2] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Open video <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <section id="news" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-10 pb-4 md:pt-14 md:pb-5">
        <div className="mb-9">
          <h2 className="text-3xl font-black tracking-tight text-[#083b66] md:text-5xl">
            News Articles
          </h2>
        </div>

        <Link
          href={samakalArticleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group grid gap-5 border-b border-slate-200 bg-white p-4 transition hover:bg-slate-50 sm:grid-cols-[220px_1fr] sm:items-center"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            <Image src="/media/samakal-article.jpg" alt="Samakal article lead image" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 220px" />
          </div>
          <div className="py-1 sm:pr-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Samakal · Rajshahi</p>
            <h3 className="mt-2 text-xl font-bold leading-[1.45] text-[#083b66] md:text-2xl" lang="bn">রুয়েটে শুরু হচ্ছে ‘কনস্ট্রাক্ট কার্নিভাল ২.০’</h3>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><span aria-hidden="true">◷</span> September 2026</p>
          </div>
        </Link>
      </section>

      <section id="facebook" className="scroll-mt-24 border-y border-slate-200 bg-white/70 px-4 pt-8 pb-20 md:pt-10 md:pb-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-[#083b66] md:text-5xl">
                Facebook Promotions
              </h2>
            </div>

          </div>

          <div className="grid gap-x-8 gap-y-2 lg:grid-cols-2">
            {promotionPosts.map((post) => (
              <Link
                key={post.href}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-4 border-b border-slate-200 bg-white p-3 transition hover:bg-blue-50/50 sm:grid-cols-[170px_1fr] sm:items-center sm:p-4"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {"image" in post && post.image ? (
                    <Image src={post.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 170px" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#1877f2] px-5 text-center text-lg font-black text-white">
                      Facebook Post
                    </div>
                  )}
                </div>
                <div className="min-w-0 py-1 sm:pr-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1877f2]">{post.publisher}</p>
                  <h3 className="mt-2 text-lg font-bold leading-snug text-[#083b66] md:text-xl">{post.title}</h3>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="flex items-center gap-2 text-sm text-slate-500"><span aria-hidden="true">◷</span> {post.date}</p>
                    <ArrowUpRight size={18} className="shrink-0 text-[#1877f2] transition group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#083b66] px-6 py-10 text-white shadow-2xl shadow-blue-950/20 md:px-12 md:py-14">
          <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500">
                <Megaphone size={23} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold md:text-3xl">Help amplify the event</h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-blue-100">
                  Follow, share, and invite your community to discover Construct Carnival 2.0.
                </p>
              </div>
            </div>
            <Link
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#083b66] transition hover:-translate-y-0.5 hover:bg-orange-50"
            >
              Follow on Facebook <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}