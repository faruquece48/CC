"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  Images,
  Sparkles,
  X,
} from "lucide-react";
import { archiveAsset, galleryAsset } from "@/config/assets";

const archiveEvents = [
  {
    name: "Construct Carnival 1.0",
    shortName: "Carnival 1.0",
    year: "2024",
    description:
      "Relive the competitions, celebrations and people who shaped the first chapter of Construct Carnival.",
    photos: Array.from({ length: 41 }, (_, index) => ({
      memoryNumber: index + 1,
      imageNumber: index + 11,
    }))
      .filter(({ memoryNumber }) => ![23, 24, 26].includes(memoryNumber))
      .map(({ memoryNumber, imageNumber }) => ({
        memoryNumber,
        src: archiveAsset(`image_${imageNumber}.webp`),
      })),
  },
  {
    name: "Construct Carnival 2.0",
    shortName: "Carnival 2.0",
    year: "2026",
    description:
      "A new chapter is being created. Photographs and highlights from Construct Carnival 2.0 will appear here soon.",
    photos: [],
  },
];

export default function ArchivePage() {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const selectedEvent = archiveEvents[selectedEventIndex];

  useEffect(() => {
    if (activePhoto === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePhoto(null);
      if (event.key === "ArrowRight") {
        setActivePhoto((current) =>
          current === null ? null : (current + 1) % selectedEvent.photos.length
        );
      }
      if (event.key === "ArrowLeft") {
        setActivePhoto((current) =>
          current === null
            ? null
            : (current - 1 + selectedEvent.photos.length) % selectedEvent.photos.length
        );
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto, selectedEvent.photos.length]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f7f2] text-[#082c27]">
      <section className="relative isolate overflow-hidden bg-[#063f36] px-4 py-16 text-white md:px-8 md:py-24">
        <div className="absolute inset-0 -z-20 opacity-25">
          <img src={archiveAsset("image_11.webp")} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#042f29] via-[#06483d]/95 to-[#06483d]/70" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-10 top-10 h-52 w-52 rounded-full border border-orange-300/20" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[5px] text-orange-300">
              <Sparkles size={18} /> Our Story
            </div>
            <h1 className="mt-5 text-5xl font-black leading-[.95] tracking-tight md:text-7xl">
              Moments that
              <span className="block text-orange-300">built a legacy.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
              Step back into the ideas, teamwork, challenges and celebrations
              that define every edition of Construct Carnival.
            </p>
          </div>

          <div className="relative hidden h-[360px] lg:block">
            <img src={archiveAsset("image_12.webp")} alt="Archive highlight" className="absolute left-0 top-8 h-64 w-48 rotate-[-6deg] rounded-3xl border-4 border-white/80 object-cover shadow-2xl" />
            <img src={archiveAsset("image_35.webp")} alt="Archive highlight" className="absolute left-40 top-0 z-10 h-72 w-52 rotate-3 rounded-3xl border-4 border-white object-cover shadow-2xl" />
            <img src={archiveAsset("image_51.webp")} alt="Archive highlight" className="absolute bottom-0 right-0 h-60 w-48 rotate-6 rounded-3xl border-4 border-orange-200 bg-white object-contain shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-8 max-w-7xl px-4 md:px-8">
        <div className="flex flex-col justify-between gap-5 rounded-3xl border border-white bg-white p-4 shadow-xl md:flex-row md:items-center md:p-5">
          <div className="flex items-center gap-3 px-2">
            <CalendarDays className="text-orange-500" />
            <span className="font-bold text-[#06483d]">Explore by edition</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {archiveEvents.map((event, index) => (
              <button
                key={event.name}
                type="button"
                onClick={() => {
                  setSelectedEventIndex(index);
                  setActivePhoto(null);
                }}
                className={`flex items-center justify-between gap-6 rounded-2xl px-5 py-3 text-left transition-all ${
                  selectedEventIndex === index
                    ? "bg-[#06483d] text-white shadow-lg"
                    : "bg-[#f2f4f1] text-[#42615c] hover:bg-[#e8eeeb]"
                }`}
              >
                <span className="font-bold">{event.shortName}</span>
                <span className={selectedEventIndex === index ? "text-orange-300" : "text-gray-400"}>{event.year}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid items-end gap-8 border-b border-[#cfdad6] pb-9 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[4px] text-orange-600">{selectedEvent.year} Edition</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#063f36] md:text-5xl">{selectedEvent.name}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#60736f]">{selectedEvent.description}</p>
          </div>
          <div className="flex gap-3">
            <Stat icon={<Camera size={20} />} value={selectedEvent.photos.length} label="Photographs" />
            <Stat icon={<Images size={20} />} value={selectedEvent.photos.length ? 1 : 0} label="Edition" />
          </div>
        </div>

        {selectedEvent.photos.length > 0 ? (
          <>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {selectedEvent.photos.map((photo, index) => {
                return (
                  <button
                    key={photo.src}
                    type="button"
                    onClick={() => setActivePhoto(index)}
                    className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-[#dbe4e0] bg-[#dfe8e4] text-left shadow-sm"
                  >
                    <img src={photo.src} alt={`${selectedEvent.name} memory ${photo.memoryNumber}`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#032c26]/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 flex w-full translate-y-4 items-center justify-between p-5 text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="font-semibold">Memory {String(photo.memoryNumber).padStart(2, "0")}</span>
                      <ArrowUpRight size={20} />
                    </div>
                  </button>
                );
              })}
            </div>

            <a href={galleryAsset("magazine.pdf")} target="_blank" rel="noopener noreferrer" className="mt-10 flex flex-col justify-between gap-5 rounded-3xl bg-orange-400 p-7 text-[#173d36] shadow-lg transition hover:-translate-y-1 hover:shadow-xl sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[3px]">Official Publication</p>
                <h3 className="mt-1 text-2xl font-black">Read the Carnival Magazine</h3>
              </div>
              <span className="flex items-center gap-2 font-bold">Open PDF <ArrowUpRight size={20} /></span>
            </a>
          </>
        ) : (
          <div className="relative mt-10 overflow-hidden rounded-[36px] bg-[#06483d] px-6 py-20 text-center text-white shadow-xl md:px-12">
            <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px]" />
            <Camera className="relative mx-auto text-orange-300" size={48} />
            <h3 className="relative mt-5 text-3xl font-black md:text-4xl">The next chapter is unfolding</h3>
            <p className="relative mx-auto mt-4 max-w-2xl leading-7 text-white/70">Photos, stories and highlights from this edition will be published here after the event.</p>
          </div>
        )}
      </section>

      {activePhoto !== null && selectedEvent.photos[activePhoto] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#021b17]/95 p-4" role="dialog" aria-modal="true" aria-label="Archive image viewer" onClick={() => setActivePhoto(null)}>
          <button type="button" onClick={() => setActivePhoto(null)} className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20" aria-label="Close image"><X /></button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setActivePhoto((activePhoto - 1 + selectedEvent.photos.length) % selectedEvent.photos.length); }} className="absolute left-3 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-8" aria-label="Previous image"><ArrowLeft /></button>
          <img src={selectedEvent.photos[activePhoto].src} alt={`${selectedEvent.name} memory ${selectedEvent.photos[activePhoto].memoryNumber}`} className="max-h-[85vh] max-w-[88vw] rounded-2xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={(event) => { event.stopPropagation(); setActivePhoto((activePhoto + 1) % selectedEvent.photos.length); }} className="absolute right-3 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-8" aria-label="Next image"><ArrowRight /></button>
          <p className="absolute bottom-5 text-sm font-semibold text-white/70">{activePhoto + 1} / {selectedEvent.photos.length}</p>
        </div>
      )}
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-[#dbe4e0] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-orange-600">{icon}<span className="text-2xl font-black text-[#063f36]">{value}</span></div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
    </div>
  );
}
