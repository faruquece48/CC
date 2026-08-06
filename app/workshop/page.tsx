"use client";

import React from "react";

export default function WorkshopPage() {

  // Set this to true when the speakers and presentation titles are finalized.
  const showSpeakerSection = false;

  const workshops = [
    {
      speaker: "Prof. Dr. Engr. Md. Jahangir Alam",
      designation: "Vice-Chancellor, RUET",
      topic:
        "SMART City Planning - Intelligent Building Technology - AI & Robotics Applications in Building Engineering",
      img: "/images/vcruet.png",
    },
    {
      speaker: "Md. Amirul Haque Bhuiya",
      designation: "DG, BWDB",
      topic: "Adaptive Water Resource Management in Bangladesh",
      img: "/images/amirul.png",
    },
    {
      speaker: "Md Ashraful Alam",
      designation: "DG, HBRI",
      topic:
        "Introduction to Bangladesh National Building Code (BNBC-2020) and its role towards Smart Bangladesh",
      img: "/images/ashraful.png",
    },
    {
      speaker: "Dr. Md. Shafiul Islam",
      designation: "Senior Research Engineer, HBRI",
      topic:
        'Presentation on Japan-Bangladesh joint research "SATREPS-TSUIB" project: Project outcomes and implementation',
      img: "/images/shafiul.png",
    },
    {
      speaker: "Pintu Kanungoe",
      designation: "Director, River Research Institute, Faridpur",
      topic:
        "Challenges and Opportunities for Sustainable River Management in Bangladesh",
      img: "/images/pintu.png",
    },
  ];

  return (
    <div className="w-full bg-[#faf9f7] overflow-hidden">

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 lg:px-10 pt-10 lg:pt-16">

        {/* Motto */}
        <div className="flex items-center justify-center gap-4 mb-14">

          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent to-orange-400" />

          <div className="flex items-center gap-3">

            <div className="w-3 h-3 rounded-full bg-orange-500" />

            <p className="text-gray-700 text-xl tracking-wide font-medium italic">
              Building Future, Managing Reality
            </p>

            <div className="w-3 h-3 rounded-full bg-orange-500" />

          </div>

          <div className="w-24 h-[2px] bg-gradient-to-l from-transparent to-orange-400" />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT CONTENT */}
          <div className="flex flex-col items-start text-left">

            <div className="mt-2 text-left">

              <p className="text-gray-800 uppercase tracking-wide text-[42px] md:text-[56px] font-bold leading-[1.05] text-left">
                WORKSHOPS &
              </p>

              <h1 className="text-[42px] md:text-[56px] font-bold text-orange-500 leading-[1.05] tracking-tight text-left">
                KEYNOTE LECTURES
              </h1>

            </div>

            <p className="text-gray-600 leading-9 text-lg text-justify max-w-2xl mt-8">
              Learn from distinguished experts and industry leaders
              about innovative ideas, smart technologies and
              sustainable development. Our keynote sessions are
              designed to inspire, inform and ignite new
              perspectives for a better tomorrow.
            </p>

          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">

            <div className="absolute inset-0 bg-orange-100 rounded-[50px] blur-3xl opacity-50" />

            <div className="relative">

              <img
                src="/images/workshop-hero.png"
                alt="Workshop Hero"
                className="w-full object-cover"
              />

            </div>

          </div>

        </div>

        {/* FEATURE SECTION */}
        <div className="mt-20 relative">

          {/* TOP BORDER */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-orange-300 to-transparent mb-10" />

          <div className="bg-white rounded-[40px] shadow-lg border border-orange-100 p-8 lg:p-12">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

              {/* FEATURE 1 */}
              <div className="flex flex-col items-center text-center px-6 relative">

                <div className="w-24 h-24 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center shadow-sm">
                  <span className="text-4xl">👥</span>
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-gray-800">
                  Expert Speakers
                </h3>

                <p className="mt-4 text-gray-600 leading-8 text-justify">
                  Hear from renowned professionals and thought
                  leaders in the industry with real-world
                  experiences and innovative visions.
                </p>

                <div className="hidden md:block absolute right-0 top-10 h-40 border-r border-dashed border-orange-300" />

              </div>

              {/* FEATURE 2 */}
              <div className="flex flex-col items-center text-center px-6 relative">

                <div className="w-24 h-24 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center shadow-sm">
                  <span className="text-4xl">💡</span>
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-gray-800">
                  Insightful Sessions
                </h3>

                <p className="mt-4 text-gray-600 leading-8 text-justify">
                  Engage in interactive and informative sessions
                  focused on emerging trends, future technologies
                  and sustainable engineering solutions.
                </p>

                <div className="hidden md:block absolute right-0 top-10 h-40 border-r border-dashed border-orange-300" />

              </div>

              {/* FEATURE 3 */}
              <div className="flex flex-col items-center text-center px-6">

                <div className="w-24 h-24 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center shadow-sm">
                  <span className="text-4xl">📄</span>
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-gray-800">
                  Knowledge Sharing
                </h3>

                <p className="mt-4 text-gray-600 leading-8 text-justify">
                  Exchange ideas, gain meaningful knowledge and
                  build valuable professional connections with
                  participants from diverse backgrounds.
                </p>

              </div>

            </div>

          </div>

          {/* BOTTOM WAVE */}
          <div className="mt-10">

            <svg
              viewBox="0 0 1440 120"
              className="w-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >

              <path
                d="M0 60C120 100 240 20 360 50C480 80 600 110 720 70C840 30 960 20 1080 50C1200 80 1320 90 1440 40"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
              />

            </svg>

          </div>

        </div>

      </div>

      {/* WORKSHOP ANNOUNCEMENT / SPEAKER SECTION */}
      {!showSpeakerSection ? (
        <section className="max-w-6xl mx-auto px-4 lg:px-8 py-20">
          <div className="relative overflow-hidden rounded-[40px] border border-orange-100 bg-white px-6 py-16 text-center shadow-lg md:px-12 md:py-20">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-orange-100/70 blur-3xl" />
            <div className="absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-orange-200/50 blur-3xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[6px] text-orange-500">
                Upcoming Workshop
              </p>

              <h2 className="mt-5 text-4xl font-light leading-tight text-gray-800 md:text-6xl">
                Our workshop will be on
                <span className="mt-2 block font-semibold text-orange-500">
                  Smart Construction
                </span>
              </h2>

              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-[2px] w-20 bg-orange-300 md:w-28" />
                <div className="h-3 w-3 rounded-full bg-orange-400" />
                <div className="h-[2px] w-20 bg-orange-300 md:w-28" />
              </div>

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-600">
                Speaker details and presentation titles will be announced soon.
              </p>
            </div>
          </div>
        </section>
      ) : (
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-20">

        {/* HEADING */}
        <div className="flex flex-col items-center mb-16">

          <p className="text-orange-500 uppercase tracking-[6px] text-sm font-semibold">
            KEYNOTE LECTURE
          </p>

          <h2 className="text-5xl md:text-6xl font-light text-gray-800 mt-5 text-center">
            Meet Our Speakers
          </h2>

          <div className="flex items-center gap-4 mt-6">

            <div className="w-24 h-[2px] bg-orange-300" />

            <div className="w-3 h-3 rounded-full bg-orange-400" />

            <div className="w-24 h-[2px] bg-orange-300" />

          </div>

        </div>

        {/* SPEAKER CARDS */}
        <div className="flex flex-col gap-8">

          {workshops.map((item, index) => (
            <div
              key={index}
              className="group bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
            >

              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-y-6 md:gap-y-0">

                {/* NUMBER */}
                <div className="md:col-span-1 flex justify-center py-6">

                  <div className="w-14 h-14 rounded-xl bg-orange-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                </div>

                {/* IMAGE */}
                <div className="md:col-span-2 flex items-center justify-center py-6">

                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100 shadow-md bg-white flex items-center justify-center">

                    <img
                      src={item.img}
                      alt={item.speaker}
                      className="w-full h-full object-cover object-top"
                    />

                  </div>

                </div>

                {/* CONTENT */}
                <div className="md:col-span-7 px-6 py-8 text-left flex flex-col items-start">

                  <h3 className="text-lg md:text-2xl font-medium text-gray-800 leading-relaxed text-left">
                    {item.topic}
                  </h3>

                  <div className="w-14 h-[3px] bg-orange-400 rounded-full my-5" />

                  <h4 className="text-orange-500 text-xl md:text-2xl font-semibold text-left">
                    {item.speaker}
                  </h4>

                  <p className="text-gray-500 mt-2 text-sm md:text-lg text-left">
                    {item.designation}
                  </p>

                </div>

                {/* ICON */}
                <div className="md:col-span-2 flex justify-center pb-8 md:pb-0">

                  <div className="w-20 h-20 rounded-full border border-orange-200 flex items-center justify-center bg-orange-50 group-hover:scale-110 transition-transform duration-300">

                    <span className="text-3xl text-orange-500">
                      🎙️
                    </span>

                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
      )}

    </div>
  );
}
