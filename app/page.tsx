"use client";

import Link from "next/link";

import ImageSlideShow from "@/components/slideshow";
import Timeline from "@/components/timeline";
import WhyJoinSection from "@/components/WhyJoinSection";
import {
  getRegistrationImpactMessage,
  getRegistrationPhase,
} from "@/config/deadline";
import { galleryAsset } from "@/config/assets";

import Marquee from "react-fast-marquee";

export default function Home() {
  const registrationPhase = getRegistrationPhase();
  const isRegistrationOpen = typeof registrationPhase === "number";
  const extensionMessage =
    registrationPhase === 2 || registrationPhase === 3
      ? getRegistrationImpactMessage()
      : null;

  const images = [
    galleryAsset("image_11.JPG"),
    galleryAsset("image_12.JPG"),
    galleryAsset("image_13.JPG"),
    galleryAsset("image_14.JPG"),
    galleryAsset("image_151.JPG"),
  ];

  return (
    <main className="w-full overflow-hidden bg-white">
      {/* ================= HERO SECTION ================= */}
      <section className="w-full px-4 lg:px-10 pt-8 lg:pt-12 bg-white">
        <div className="max-w-7xl mx-auto">

          {/* ================= TOP CENTER TITLE ================= */}
          <div className="flex flex-col items-center justify-center text-center mb-10">
            <h3
              className="
                text-4xl
                md:text-5xl
                lg:text-6xl
                font-extrabold
                bg-gradient-to-r
                from-[#0f4c3a]
                via-[#b8860b]
                to-[#c05621]
                bg-clip-text
                text-transparent
                leading-tight
              "
            >
              Construct Carnival 2.0
            </h3>

            {/* Motto */}
            <div className="flex items-center justify-center gap-4 mt-4 mb-2">
              <div className="w-16 lg:w-24 h-[2px] bg-gradient-to-r from-transparent to-orange-400"></div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>

                <p className="text-gray-700 text-lg lg:text-2xl tracking-wide font-medium italic">
                  Building Future, Managing Reality
                </p>

                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              </div>

              <div className="w-16 lg:w-24 h-[2px] bg-gradient-to-l from-transparent to-orange-400"></div>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-10
              items-center
            "
          >
            {/* ================= LEFT CONTENT ================= */}
            <div className="flex flex-col justify-center">
              {/* Main Heading */}
              <h1
                className="
                  text-[38px]
                  md:text-[52px]
                  lg:text-[50px]
                  font-extrabold
                  leading-[0.9]
                  tracking-[-1.5px]
                  text-[#071c18]
                "
              >
                <span className="whitespace-nowrap">
                  Building Future Engineers
                </span>

                <br />

                <span className="text-[#d18b00]">
                  for Bangladesh
                </span>
              </h1>

              {/* Intro Description */}
              <div className="mt-6 space-y-5">
                <p
                  className="
                    text-gray-700
                    text-[15px]
                    lg:text-[17px]
                    leading-8
                    font-medium
                    text-justify
                  "
                >
                  A nationwide festival for students of{" "}
                  <span className="font-bold text-[#071c18]">
                    Building Engineering & Construction
                    Management
                  </span>
                  ,{" "}
                  <span className="font-bold text-[#071c18]">
                    Civil Engineering
                  </span>
                  ,{" "}
                  <span className="font-bold text-[#071c18]">
                    Urban & Regional Planning
                  </span>
                  , and{" "}
                  <span className="font-bold text-[#071c18]">
                    Architecture
                  </span>{" "}
                  connecting future innovators through
                  competitions, workshops, creativity,
                  collaboration, and leadership.
                </p>

                {/* Additional Paragraph */}
                <p
                  className="
                    text-gray-700
                    text-[15px]
                    lg:text-[17px]
                    leading-8
                    font-medium
                    text-justify
                  "
                >
                  Construct Carnival creates a collaborative
                  platform where students, academics, and
                  industry professionals come together to
                  exchange ideas, showcase innovation,
                  develop technical excellence, and inspire
                  the next generation of engineers,
                  planners, architects, and nation builders.
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/workshop">
                  <button
                    className="
                      bg-[#063f35]
                      text-white
                      px-7
                      py-3
                      rounded-2xl
                      font-semibold
                      hover:scale-105
                      transition-all
                      duration-300
                      shadow-md
                    "
                  >
                    Workshop →
                  </button>
                </Link>

                <Link href="/events">
                  <button
                    className="
                      border-2
                      border-[#063f35]
                      text-[#063f35]
                      px-7
                      py-3
                      rounded-2xl
                      font-semibold
                      hover:bg-[#063f35]
                      hover:text-white
                      transition-all
                      duration-300
                    "
                  >
                    View Events →
                  </button>
                </Link>
              </div>
            </div>

            {/* ================= RIGHT IMAGE ================= */}
            <div className="flex items-center justify-center">
              <div
                className="
                  w-full
                  max-w-[560px]
                  lg:h-[360px]
                  overflow-hidden
                "
              >
                <ImageSlideShow images={images} />
              </div>
            </div>
          </div>

        </div>
      </section>

      <WhyJoinSection />

      {/* ================= MOVING NOTICE ================= */}
      <section className="w-full px-4 lg:px-10 mt-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div
            className="
              bg-gradient-to-r
              from-[#c7005c]
              via-[#d10067]
              to-[#c7005c]
              rounded-xl
              shadow-lg
              overflow-hidden
            "
          >
            <Marquee
              speed={55}
              gradient={false}
              pauseOnHover={true}
              autoFill={true}
              className="py-3"
            >
              <div className="flex items-center">
                {extensionMessage ? (
                  <span className="text-white font-semibold text-sm lg:text-base mx-10">
                    📢 {extensionMessage}
                  </span>
                ) : (
                  <>
                {isRegistrationOpen && (
                  <>
                    <span className="text-white font-semibold text-sm lg:text-base mx-10">
                      🏗️ Welcome to Construct Carnival
                    </span>

                    <span className="text-white/70 text-xl">
                      •
                    </span>
                  </>
                )}

                <span className="text-white font-semibold text-sm lg:text-base mx-10">
                  {isRegistrationOpen
                    ? "📢 Registration is Open Now!!!"
                    : "📢 Registration will open soon"}
                </span>

                <span className="text-white/70 text-xl">
                  •
                </span>

                {!isRegistrationOpen && (
                  <>
                    <span className="text-white font-semibold text-sm lg:text-base mx-10">
                      ⏰ Please stay tuned for updates
                    </span>

                    <span className="text-white/70 text-xl">
                      •
                    </span>
                  </>
                )}

                <span className="text-white font-semibold text-sm lg:text-base mx-10">
                  🎯 Accept the challenge and prove your skills
                </span>

                <span className="text-white/70 text-xl">
                  •
                </span>

                <span className="text-white font-semibold text-sm lg:text-base mx-10">
                  🚀 Don’t miss this opportunity
                </span>
                  </>
                )}
              </div>
            </Marquee>
          </div>
        </div>
      </section>

      {/* ================= DISCOVER SECTION ================= */}
      <section
        className="
          w-full
          px-4
          lg:px-10
          mt-6
          py-10
          bg-white
        "
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2
              className="
                text-4xl
                lg:text-5xl
                font-bold
                text-[#083d35]
                leading-tight
              "
            >
              Discover BECM & Construct Carnival
            </h2>

            <p
              className="
                text-gray-500
                mt-2
                text-base
                lg:text-lg
              "
            >
              Explore our journey, mission and impact
            </p>
          </div>

          <Timeline />
        </div>
      </section>
    </main>
  );
}
