"use client";

import { useState } from "react";

import { title } from "@/components/primitives";

import { CalendarDays, ChevronDown } from "lucide-react";

const archiveEvents = [
  {
    name: "Construct Carnival 1.0",
    year: "2024",
    description:
      "Explore memorable moments, exciting competitions and vibrant experiences from Construct Carnival 1.0.",

    photos: Array.from({ length: 41 }, (_, index) => ({
      src: `/archive/image_${index + 11}.webp`,
    })),
  },

  {
    name: "Construct Carnival 2.0",
    year: "2026",
    description:
      "More memories from Construct Carnival 2.0 will be added soon.",

    photos: [],
  },
];

export default function MemoriesPage() {
  const [selectedEvent, setSelectedEvent] = useState(archiveEvents[1]);

  return (
    <div className="w-full bg-white px-4 lg:px-10 py-10">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center">
        <h1
          className={title({
            className:
              "!text-4xl md:!text-6xl !font-black tracking-tight",
          })}
        >
          EVENT ARCHIVE
        </h1>

        <p className="mt-5 text-gray-600 max-w-3xl mx-auto text-base md:text-lg leading-relaxed">
          Relive the memorable moments, competitions, celebrations and
          unforgettable experiences from Construct Carnival.
        </p>
      </div>

      {/* Dropdown */}
      <div className="max-w-md mx-auto mt-10 relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
          <CalendarDays size={18} />
        </div>

        <select
          value={selectedEvent.name}
          onChange={(e) => {
            const selected = archiveEvents.find(
              (item) => item.name === e.target.value
            );

            if (selected) setSelectedEvent(selected);
          }}
          className="w-full appearance-none rounded-2xl border border-gray-300 bg-white py-4 pl-12 pr-12 text-gray-800 shadow-sm outline-none transition-all duration-300 hover:shadow-md focus:border-green-600"
        >
          {archiveEvents.map((event, index) => (
            <option key={index} value={event.name}>
              {event.name}
            </option>
          ))}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Event Title */}
      <div className="max-w-5xl mx-auto mt-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-black">
          {selectedEvent.name}
        </h2>

        <p className="mt-4 text-gray-600 text-base md:text-lg leading-relaxed">
          {selectedEvent.description}
        </p>
      </div>

      {/* Gallery */}
      {selectedEvent.photos.length > 0 ? (
        <div className="max-w-7xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedEvent.photos.map((photo, index) => {
            const isLastImage =
              index === selectedEvent.photos.length - 1;

            const imageCard = (
              <div className="group relative overflow-hidden rounded-3xl shadow-md bg-white cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.src}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  />
                </div>
              </div>
            );

            return isLastImage ? (
              <a
                key={index}
                href="/gallery/magazine.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                {imageCard}
              </a>
            ) : (
              <div key={index}>{imageCard}</div>
            );
          })}
        </div>
      ) : (
        /* Coming Soon Section */
        <div className="max-w-5xl mx-auto mt-20">
          <div className="rounded-[32px] bg-gradient-to-r from-green-600 to-emerald-500 p-10 text-center text-white shadow-xl">
            <h3 className="text-3xl md:text-4xl font-bold">
              More Memories Coming Soon
            </h3>

            <p className="mt-4 text-white/90 text-sm md:text-lg leading-relaxed max-w-3xl mx-auto">
              Stay connected with Construct Carnival to explore future events,
              competitions, workshops and unforgettable experiences.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}