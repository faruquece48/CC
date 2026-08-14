"use client";

import { Image, Link } from "@nextui-org/react";

import sponsorBg from "@/public/images/sponsor_background.png";

import platinumsponsor from "@/public/sponsors/platinum_sponsors.png";

import bsrm from "@/public/sponsors/bsrm1.png";
import rainbow from "@/public/sponsors/rainbow.png";

import sevenring from "@/public/sponsors/sevenring.png";
import modern from "@/public/sponsors/modern.png";
import innovate from "@/public/sponsors/innovate.png";
import newvision from "@/public/sponsors/newvison.png";

import rupali from "@/public/sponsors/rupali.png";
import brack from "@/public/sponsors/brack1.png";

import somoy from "@/public/sponsors/somoy.png";
import iqac from "@/public/sponsors/IQAC.png";

import AdsterraBanner from "@/components/AdsterraBanner";

export default function SponsorsPage() {
  // Set this to true if the previous sponsor list needs to be shown again.
  const showPreviousSponsors = false;

  return (
    <div className="w-full bg-[#f7f9fc] overflow-hidden">

      {/* HERO SECTION */}
      <section
        className="relative w-full py-8 md:py-20"
        style={{
          backgroundImage: `url(${sponsorBg.src})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-[#001B24]/15" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide">
            OUR SPONSORS
          </h1>

          <div className="flex items-center justify-center mt-3 gap-5">

            <div
              className="
                w-24 md:w-44
                h-[2px]
                bg-gradient-to-r
                from-transparent
                via-[#dbe4ea]
                to-[#ffffff]
                rounded-full
              "
            />

            <div className="relative flex items-center justify-center">

              <div className="absolute w-8 h-8 rounded-full bg-white/20 blur-lg" />

              <div
                className="
                  w-4 h-4
                  rotate-45
                  bg-gradient-to-br
                  from-white
                  to-[#cbd5e1]
                  border border-white/70
                "
              />

            </div>

            <div
              className="
                w-24 md:w-44
                h-[2px]
                bg-gradient-to-l
                from-transparent
                via-[#dbe4ea]
                to-[#ffffff]
                rounded-full
              "
            />

          </div>

          <p className="mt-2 text-xs md:text-base text-gray-200 leading-relaxed">
            Building a stronger future together.
            <br />
            We thank our sponsors for their support and contribution.
          </p>

        </div>
      </section>

      {/* CURRENT SPONSOR */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionTitle text="CONFIRMED SPONSORS" />

        <div className="relative mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-md md:p-12">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />

          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <Link
              href="https://sevenringscement.com/"
              isExternal
              className="flex min-h-[180px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
            >
              <Image
                src={sevenring.src}
                alt="Seven Rings Cement"
                className="max-h-32 w-auto object-contain"
              />
            </Link>

            <div className="text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-[4px] text-[#0b4d8a]">
                Proudly Supporting Us
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#083b66] md:text-4xl">
                Seven Rings Cement
              </h2>
              <p className="mt-5 leading-7 text-gray-600">
                We sincerely thank Seven Rings Cement for supporting our
                upcoming program and joining us in building a stronger future.
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-md md:p-12">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <Link
              href="https://www.ruet.ac.bd/section/IQAC"
              isExternal
              className="flex min-h-[180px] items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
            >
              <Image
                src={iqac.src}
                alt="Institutional Quality Assurance Cell, RUET"
                className="max-h-40 w-auto object-contain"
              />
            </Link>

            <div className="text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-[4px] text-[#0b4d8a]">
                Proudly Supporting Us
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#083b66] md:text-4xl">
                IQAC, RUET
              </h2>
              <p className="mt-5 leading-7 text-gray-600">
                We sincerely thank the Institutional Quality Assurance Cell of
                RUET for sponsoring our upcoming program and supporting our
                commitment to excellence.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-[#6d87a8] bg-white/70 px-6 py-6 text-center">
          <h3 className="text-xl font-semibold text-[#083b66]">
            More sponsorship opportunities are available
          </h3>
          <p className="mx-auto mt-2 max-w-2xl leading-7 text-gray-600">
            Additional sponsors and partners will be announced as they are
            confirmed.
          </p>
        </div>
      </section>

      {/* PREVIOUS SPONSOR LIST — preserved for future use */}
      <section
        className={`${showPreviousSponsors ? "block" : "hidden"} max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10`}
      >

        {/* PLATINUM */}
        <div>

          <SectionTitle text="PLATINUM SPONSOR" />

          <div
            className="
              bg-white
              border border-gray-200
              rounded-3xl
              shadow-md
              p-6
              mt-4
            "
          >
            <div className="grid md:grid-cols-3 gap-6 items-center">

              <div className="flex justify-center">
                <Link href="https://www.tamzidgroup.com/" isExternal>
                  <Image
                    src={platinumsponsor.src}
                    alt="Platinum Sponsor"
                    className="object-contain max-h-24 w-auto"
                  />
                </Link>
              </div>

              <div className="md:col-span-2 text-center md:text-left">

                <h2 className="text-2xl md:text-3xl font-bold text-[#083b66]">
                  Tamzid Group of Industries
                </h2>

                <div className="flex items-center mt-3 mb-4 justify-center md:justify-start gap-3">

                  <div
                    className="
                      w-30 md:w-44
                      h-[2px]
                      bg-gradient-to-r
                      from-transparent
                      via-[#7dd3fc]
                      to-[#38bdf8]
                      rounded-full
                    "
                  />

                  <div
                    className="
                      w-3 h-3
                      rotate-45
                      bg-gradient-to-br
                      from-[#7dd3fc]
                      to-[#38bdf8]
                    "
                  />

                  <div
                    className="
                      w-30 md:w-44
                      h-[2px]
                      bg-gradient-to-l
                      from-transparent
                      via-[#7dd3fc]
                      to-[#38bdf8]
                      rounded-full
                    "
                  />

                </div>

                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Proudly supporting innovation, engineering excellence,
                  and academic development through sponsorship and collaboration.
                </p>

              </div>

            </div>
          </div>
        </div>

        {/* GOLD */}
        <div>

          <SectionTitle text="GOLD SPONSORS" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

            <SponsorCard
              href="https://www.bsrm.com/"
              image={bsrm.src}
            />

            <SponsorCard
              href="http://rainbow-automation.net/"
              image={rainbow.src}
            />

          </div>
        </div>

        {/* ASSOCIATING */}
        <div>

          <SectionTitle text="ASSOCIATING SPONSORS" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

            <SmallSponsorCard
              href="https://sevenringscement.com/"
              image={sevenring.src}
            />

            <SmallSponsorCard
              href="http://modernstructuresltd.com/"
              image={modern.src}
            />

            <SmallSponsorCard
              href="https://www.iecbd.org/"
              image={innovate.src}
            />

            <SmallSponsorCard
              href="https://newvision-bd.com/"
              image={newvision.src}
            />

          </div>
        </div>

        {/* BANKING + MEDIA */}
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* BANKING */}
          <div>

            <SectionTitleSmall text="BANKING PARTNERS" />

            <div className="grid grid-cols-2 gap-8 mt-8">

              <Link
                href="https://rupalibank.com.bd/"
                isExternal
                className="block w-full"
              >
                <div
                  className="
                    bg-white
                    border border-gray-200
                    rounded-2xl
                    shadow-md
                    hover:shadow-xl
                    hover:-translate-y-1
                    transition-all duration-300
                    h-[170px]
                    flex
                    items-center
                    justify-center
                    p-6
                  "
                >
                  <div
                    className="
                      w-[140px]
                      h-[90px]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Image
                      src={rupali.src}
                      alt="Rupali Bank"
                      className="
                        object-contain
                        max-w-full
                        max-h-full
                      "
                    />
                  </div>

                </div>
              </Link>

              <Link
                href="https://www.bracbank.com/en/"
                isExternal
                className="block w-full"
              >
                <div
                  className="
                    bg-white
                    border border-gray-200
                    rounded-2xl
                    shadow-md
                    hover:shadow-xl
                    hover:-translate-y-1
                    transition-all duration-300
                    h-[170px]
                    flex
                    items-center
                    justify-center
                    p-6
                  "
                >
                  <div
                    className="
                      w-[140px]
                      h-[90px]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <Image
                      src={brack.src}
                      alt="BRAC Bank"
                      className="
                        object-contain
                        max-w-full
                        max-h-full
                      "
                    />
                  </div>

                </div>
              </Link>

            </div>
          </div>

          {/* MEDIA */}
          <div>

            <SectionTitleSmall text="PRINT & MEDIA PARTNERS" />

            <div className="flex justify-center mt-8">

              <div className="w-full max-w-[320px]">

                <Link
                  href="https://www.somoynews.tv/"
                  isExternal
                  className="block w-full"
                >
                  <div
                    className="
                      bg-white
                      border border-gray-200
                      rounded-2xl
                      shadow-md
                      hover:shadow-xl
                      hover:-translate-y-1
                      transition-all duration-300
                      h-[170px]
                      flex
                      items-center
                      justify-center
                      p-6
                    "
                  >
                    <div
                      className="
                        w-[170px]
                        h-[90px]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Image
                        src={somoy.src}
                        alt="Somoy News"
                        className="
                          object-contain
                          max-w-full
                          max-h-full
                        "
                      />
                    </div>

                  </div>
                </Link>

              </div>

            </div>
          </div>

        </div>

      </section>

      
    </div>
  );
}

/* MAIN TITLE */
function SectionTitle({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">

      <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-[#6d87a8]" />

      <div
        className="
          bg-gradient-to-r from-[#002d62] to-[#0b4d8a]
          text-white
          px-8 py-2
          font-bold
          uppercase
          tracking-wide
          text-[11px] md:text-base
          shadow-sm
        "
        style={{
          clipPath:
            "polygon(6% 0%, 94% 0%, 100% 50%, 94% 100%, 6% 100%, 0% 50%)",
        }}
      >
        {text}
      </div>

      <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent to-[#6d87a8]" />

    </div>
  );
}

/* SMALL TITLE */
function SectionTitleSmall({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">

      <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-[#6d87a8]" />

      <div
        className="
          bg-gradient-to-r from-[#002d62] to-[#0b4d8a]
          text-white
          px-5 py-2
          font-semibold
          uppercase
          tracking-wide
          text-[9px] md:text-[11px]
        "
        style={{
          clipPath:
            "polygon(7% 0%, 93% 0%, 100% 50%, 93% 100%, 7% 100%, 0% 50%)",
        }}
      >
        {text}
      </div>

      <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent to-[#6d87a8]" />

    </div>
  );
}

/* LARGE CARD */
function SponsorCard({
  href,
  image,
}: {
  href: string;
  image: string;
}) {
  return (
    <Link href={href} isExternal className="block w-full">

      <div
        className="
          bg-white
          border border-gray-200
          rounded-3xl
          shadow-sm
          h-[170px]
          flex items-center justify-center
          p-6
          hover:shadow-lg
          transition
        "
      >
        <div className="w-[220px] h-[100px] flex items-center justify-center">

          <Image
            src={image}
            alt="Sponsor"
            className="
              object-contain
              max-w-full
              max-h-full
            "
          />

        </div>
      </div>

    </Link>
  );
}

/* SMALL CARD */
function SmallSponsorCard({
  href,
  image,
}: {
  href: string;
  image: string;
}) {
  return (
    <Link href={href} isExternal className="w-full">

      <div
        className="
          bg-white
          border border-gray-200
          rounded-2xl
          shadow-sm
          p-4
          min-h-[110px]
          flex items-center justify-center
          hover:shadow-md
          transition
        "
      >
        <div className="w-full h-full flex items-center justify-center">

          <Image
            src={image}
            alt="Sponsor"
            className="
              object-contain
              max-h-[65px]
              w-auto
              mx-auto
            "
          />

        </div>
      </div>

    </Link>
  );
}
