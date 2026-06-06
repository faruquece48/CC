"use client";

import Link from "next/link";

import {
  GraduationCap,
  Briefcase,
  Building2,
} from "lucide-react";

import { timelineData } from "@/lib/data";

export default function Timeline() {

  return (
    <section className="w-full py-10 px-4">

      <div className="max-w-7xl mx-auto">

        {/* TIMELINE */}
        <div className="relative">

          {/* CENTER LINE */}
          <div
            className="
              hidden
              lg:block
              absolute
              left-1/2
              top-0
              bottom-0
              w-[3px]
              bg-gray-300
              -translate-x-1/2
            "
          />

          <div className="flex flex-col gap-14">

            {timelineData.map((item, index) => {

              const icons = [
                GraduationCap,
                Briefcase,
                Building2,
              ];

              const Icon = icons[index % icons.length];

              return (
                <div
                  key={index}
                  className={`
                    relative
                    flex
                    w-full
                    ${
                      index % 2 === 0
                        ? "lg:justify-start"
                        : "lg:justify-end"
                    }
                  `}
                >

                  {/* CENTER ICON */}
                  <div
                    className="
                      hidden
                      lg:flex
                      absolute
                      left-1/2
                      top-1/2
                      -translate-x-1/2
                      -translate-y-1/2
                      z-20
                      items-center
                      justify-center
                      w-16
                      h-16
                      rounded-full
                      bg-[#085041]
                      shadow-lg
                      border-4
                      border-white
                    "
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* CARD */}
                  <div
                    className="
                      w-full
                      lg:w-[43%]
                      bg-[#f8faf9]
                      rounded-3xl
                      border
                      border-gray-200
                      shadow-sm
                      p-8
                      transition-all
                      duration-300
                      hover:shadow-xl
                      hover:-translate-y-1
                    "
                  >

                    {/* MOBILE ICON */}
                    <div
                      className="
                        lg:hidden
                        w-14
                        h-14
                        rounded-2xl
                        bg-[#085041]
                        flex
                        items-center
                        justify-center
                        mb-6
                      "
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* TITLE */}
                    <h3
                      className="
                        text-2xl
                        font-bold
                        text-[#062c25]
                        mb-4
                      "
                    >
                      {item.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p
                      className="
                        text-gray-600
                        leading-8
                        text-[15px]
                      "
                    >
                      {item.description}
                    </p>

                    {/* SEE MORE BUTTON */}
                    <Link href={item.details}>

                      <button
                        className="
                          mt-6
                          text-[#085041]
                          font-semibold
                          hover:underline
                          transition-all
                        "
                      >
                        See more →
                      </button>

                    </Link>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>

    </section>
  );
}