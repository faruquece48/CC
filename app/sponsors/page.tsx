"use client";

import { Image, Link } from "@nextui-org/react";
import NextImage from "next/image";

import sponsorBg from "@/public/images/sponsor_background.png";

import bsrm from "@/public/sponsors/bsrm1.png";
import rainbow from "@/public/sponsors/rainbow.png";

import modern from "@/public/sponsors/modern.png";
import innovate from "@/public/sponsors/innovate.png";
import newvision from "@/public/sponsors/newvison.png";

import rupali from "@/public/sponsors/rupali.png";
import brack from "@/public/sponsors/brack1.png";

import somoy from "@/public/sponsors/somoy.png";
import iqac from "@/public/sponsors/IQAC.png";
import samakal from "@/public/logo/samakal.png";
import akij from "@/public/logo/Akij.jpeg";
import crownCement from "@/public/logo/Crown Cement.jpeg";
import bergerFosroc from "@/public/logo/Berger Fosroc Logo.png";

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
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <SectionTitle text="TITLE SPONSOR" />

        <div className="relative mt-6 overflow-hidden rounded-2xl border border-amber-200 bg-white p-6 shadow-md md:p-8">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />

          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <Link href="https://akijceramics.net/" isExternal className="flex min-h-[190px] w-full items-center justify-center border border-amber-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              <NextImage
                src={akij}
                alt="Akij Ceramics"
                className="h-auto w-full max-w-[290px] object-contain"
                sizes="(max-width: 768px) 75vw, 290px"
              />
            </Link>

            <div className="text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-[4px] text-[#c4471b]">
                Proudly Supporting Us
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#083b66] md:text-3xl">
                AKIJ CERAMICS
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                We sincerely thank Akij Ceramics, our Title Sponsor, for
                supporting Construct Carnival 2.0 and helping us create an
                inspiring platform for future professionals.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 md:mt-16">
          <SectionTitle text="SILVER SPONSORS" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            href="https://crowncement.com/"
            isExternal
            aria-label="Visit Crown Cement website"
            className="flex min-h-[170px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <NextImage src={crownCement} alt="Crown Cement logo" className="h-auto max-h-[120px] w-auto max-w-full object-contain" sizes="(max-width: 640px) 80vw, 360px" />
          </Link>

          <Link
            href="http://www.bergerfosroc.com"
            isExternal
            aria-label="Visit Berger Fosroc website"
            className="flex min-h-[170px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <NextImage src={bergerFosroc} alt="Berger Fosroc logo" className="h-auto max-h-[120px] w-auto max-w-full object-contain" sizes="(max-width: 640px) 80vw, 360px" />
          </Link>
        </div>
        <div className="mt-12">
          <SectionTitle text="ASSOCIATING SPONSOR" />
        </div>

        <Link
          href="https://www.ruet.ac.bd/section/IQAC"
          isExternal
          className="mx-auto mt-6 flex min-h-[170px] max-w-[360px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <Image
            src={iqac.src}
            alt="Institutional Quality Assurance Cell, RUET"
            className="max-h-[130px] max-w-full object-contain"
          />
        </Link>


      </section>

      <section className="mx-auto max-w-4xl px-4 pb-10 md:px-8 md:pb-12">
        <SectionTitle text="MEDIA PARTNER" />

        <Link
          href="https://samakal.com/"
          isExternal
          className="mx-auto mt-6 flex h-[170px] max-w-[360px] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <Image
            src={samakal.src}
            alt="Samakal"
            className="max-h-[110px] max-w-full scale-[2.25] object-contain"
          />
        </Link>
      </section>
      {/* PREVIOUS SPONSOR LIST — preserved for future use */}
      <section
        className={`${showPreviousSponsors ? "block" : "hidden"} max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10`}
      >

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
