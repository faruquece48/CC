"use client";

import AdsterraBanner from "@/components/AdsterraBanner";

export default function FooterAdvertisement() {
  return (
    <section className="w-full py-0">

      <div className="max-w-7xl mx-auto px-0">

        {/* DESKTOP */}
        <div className="hidden md:flex justify-center leading-none">

          <AdsterraBanner
            adKey="23cf8dbb69977b0d73645731506658fb"
            width={728}
            height={90}
          />

        </div>

        {/* MOBILE */}
        <div className="flex md:hidden justify-center leading-none">

          <AdsterraBanner
            adKey="23cf8dbb69977b0d73645731506658fb"
            width={320}
            height={50}
          />

        </div>

      </div>

    </section>
  );
}