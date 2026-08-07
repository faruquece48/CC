"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import {
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  Trophy,
  Users,
  GraduationCap,
  CalendarDays,
  Briefcase,
  Eye,
  Radio,
  Sun,
  Globe,
  HeartHandshake,
} from "lucide-react";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YoutubeIcon,
} from "@/components/icons";

import FooterAdvertisement from "@/components/FooterAdvertisement";

interface VisitorData {
  total: number;
  todayCount: number;
  current: number;
}

function FooterSection() {
  const [visitors, setVisitors] = useState<VisitorData>({
    total: 0,
    todayCount: 0,
    current: 0,
  });

  useEffect(() => {
    const registerVisitor = async () => {
      try {
        let sessionId = sessionStorage.getItem("vid");

        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem("vid", sessionId);
        }

        const res = await fetch("/api/visitors", {
          method: "POST",
          headers: {
            "x-session-id": sessionId,
          },
        });

        if (res.ok) {
          const data: VisitorData = await res.json();
          setVisitors(data);
        }
      } catch (error) {
        console.error("Visitor counter error:", error);
      }
    };

    registerVisitor();

    const interval = setInterval(() => {
      registerVisitor();
    }, 20000);

    const handleLeave = () => {
      const sessionId = sessionStorage.getItem("vid");

      if (sessionId) {
        navigator.sendBeacon(
          "/api/visitors-leave",
          new Blob([JSON.stringify({ sessionId })], {
            type: "application/json",
          })
        );
      } else {
        navigator.sendBeacon("/api/visitors-leave");
      }
    };

    window.addEventListener("beforeunload", handleLeave);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, []);

  const visitorStats = [
    {
      label: "Live Now",
      value: visitors.current,
      icon: <Radio size={13} className="text-green-400 flex-shrink-0" />,
      valueColor: "text-green-400",
      dotColor: "bg-green-400",
      showPulse: true,
    },
    {
      label: "Today",
      value: visitors.todayCount,
      icon: <Sun size={13} className="text-yellow-400 flex-shrink-0" />,
      valueColor: "text-yellow-400",
      dotColor: "bg-yellow-400",
      showPulse: false,
    },
    {
      label: "Total",
      value: visitors.total,
      icon: <Globe size={13} className="text-blue-300 flex-shrink-0" />,
      valueColor: "text-blue-300",
      dotColor: "bg-blue-300",
      showPulse: false,
    },
  ];

  return (
    <div className="w-full">

      {/* ADVERTISEMENT */}
      {/* <FooterAdvertisement /> */}

      {/* FOOTER */}
      <div className="w-full px-4 lg:px-8 pt-4">

        <footer
          className="
            relative
            max-w-7xl
            mx-auto
            overflow-hidden
            text-white
            rounded-t-[28px]
          "
          style={{
            backgroundImage: "url('/images/footer_background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/72" />

          {/* MAIN CONTENT */}
          <div className="relative z-10 px-6 lg:px-8 py-6">

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-[1.1fr_0.9fr_1.15fr_1fr]
                gap-8
                xl:gap-10
                items-start
              "
            >

              {/* COLUMN 1 */}
              <div className="max-w-[290px]">

                {/* LOGO */}
                <div className="flex items-center gap-3 mb-4">

                  <img
                    src="/logo/blue-main.svg"
                    alt="Construct Carnival"
                    className="
                      w-12
                      h-12
                      object-contain
                      bg-white
                      rounded-full
                      p-1
                    "
                  />

                  <div>
                    <h2 className="text-lg font-bold leading-tight">
                      CONSTRUCT
                    </h2>

                    <h2 className="text-lg font-bold leading-tight">
                      CARNIVAL 2.0
                    </h2>
                  </div>

                </div>

                {/* DESCRIPTION */}
                <p className="text-gray-200 leading-6 text-sm">
                  A nationwide engineering festival fostering innovation,
                  creativity and future leadership.
                </p>

                {/* SOCIAL ICONS */}
                <div className="flex items-center gap-2 mt-5">

                  <Link
                    href="#"
                    className="
                      w-9
                      h-9
                      rounded-full
                      border
                      border-white/30
                      flex
                      items-center
                      justify-center
                      hover:bg-white
                      hover:text-black
                      transition-all
                    "
                  >
                    <FacebookIcon />
                  </Link>

                  <Link
                    href="#"
                    className="
                      w-9
                      h-9
                      rounded-full
                      border
                      border-white/30
                      flex
                      items-center
                      justify-center
                      hover:bg-white
                      hover:text-black
                      transition-all
                    "
                  >
                    <InstagramIcon />
                  </Link>

                  <Link
                    href="#"
                    className="
                      w-9
                      h-9
                      rounded-full
                      border
                      border-white/30
                      flex
                      items-center
                      justify-center
                      hover:bg-white
                      hover:text-black
                      transition-all
                    "
                  >
                    <LinkedInIcon />
                  </Link>

                  <Link
                    href="#"
                    className="
                      w-9
                      h-9
                      rounded-full
                      border
                      border-white/30
                      flex
                      items-center
                      justify-center
                      hover:bg-white
                      hover:text-black
                      transition-all
                    "
                  >
                    <YoutubeIcon />
                  </Link>

                </div>

                {/* VISITOR COUNTER */}
                <div className="mt-5 flex flex-col gap-2">

                  <div className="flex items-center gap-1.5 mb-1">

                    <Eye size={14} className="text-yellow-400" />

                    <span className="text-[12px] uppercase tracking-widest text-white font-semibold">
                      Site Visitors
                    </span>

                  </div>

                  {visitorStats.map(
                    ({
                      label,
                      value,
                      icon,
                      valueColor,
                      dotColor,
                      showPulse,
                    }) => (
                      <div
                        key={label}
                        className="
                          flex
                          items-center
                          justify-start
                          gap-2.5
                          w-[230px]
                          bg-white/8
                          border
                          border-white/15
                          rounded-full
                          px-4
                          py-2
                          backdrop-blur-md
                          text-sm
                          text-gray-100
                          hover:bg-white/12
                          transition-all
                          duration-200
                        "
                      >

                        <div className="w-4 flex justify-center flex-shrink-0">

                          {showPulse ? (
                            <span className="relative flex h-2.5 w-2.5">

                              <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}
                              />

                              <span
                                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`}
                              />

                            </span>
                          ) : (
                            icon
                          )}

                        </div>

                        <span className="text-sm text-gray-200 min-w-[80px] text-left">
                          {label}
                        </span>

                        <span
                          className={`font-bold text-[15px] leading-none ${valueColor} tabular-nums ml-auto`}
                        >
                          {value.toLocaleString()}
                        </span>

                      </div>
                    )
                  )}

                </div>
              </div>

              {/* COLUMN 2 */}
              <div className="lg:pl-2">

                <h3 className="text-xl font-bold mb-4">
                  Quick Links
                </h3>

                <div className="space-y-3">

                  {[
                    { name: "Home", href: "/" },
                    { name: "Workshop", href: "/workshop" },
                    { name: "Events", href: "/events" },
                    { name: "Registration", href: "/registration" },
                    { name: "Schedule", href: "/schedule" },
                    { name: "Sponsors", href: "/sponsors" },
                    { name: "Archive", href: "/archive" },
                    { name: "Contact", href: "/contact" },
                  ].map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="
                        flex
                        items-center
                        gap-2
                        text-gray-200
                        hover:text-yellow-400
                        transition-all
                        text-sm
                      "
                    >

                      <ChevronRight size={15} />

                      {item.name}

                    </Link>
                  ))}

                </div>
              </div>

              {/* COLUMN 3 */}
              <div className="lg:px-1">

                <h3 className="text-xl font-bold mb-4">
                  Event Highlights
                </h3>

                <div className="space-y-2">

                  {[
                    {
                      icon: <Trophy className="text-yellow-400 w-4 h-4" />,
                      text: "5+ Events",
                    },
                    {
                      icon: <Users className="text-yellow-400 w-4 h-4" />,
                      text: "600+ Participants",
                    },
                    {
                      icon: (
                        <GraduationCap className="text-yellow-400 w-4 h-4" />
                      ),
                      text: "20+ Universities",
                    },
                    {
                      icon: (
                        <CalendarDays className="text-yellow-400 w-4 h-4" />
                      ),
                      text: "2-Day Festival",
                    },
                    {
                      icon: <Briefcase className="text-yellow-400 w-4 h-4" />,
                      text: "National Networking Opportunity",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="
                        flex
                        items-center
                        gap-3
                        bg-white/10
                        rounded-lg
                        px-3
                        py-2.5
                        backdrop-blur-sm
                        text-sm
                      "
                    >

                      {item.icon}

                      <span>{item.text}</span>

                    </div>
                  ))}

                </div>
              </div>

              {/* COLUMN 4 */}
              <div className="lg:pl-3">

                <h3 className="text-xl font-bold mb-4">
                  Contact Information
                </h3>

                <div className="space-y-4 text-gray-200 text-sm">

                  <div className="flex gap-3">

                    <MapPin className="min-w-[16px] mt-1" />

                    <p className="leading-6">
                      Department of Building Engineering &amp; Construction
                      Management
                      <br />
                      RUET, Rajshahi, Bangladesh
                    </p>

                  </div>

                  <div className="flex items-center gap-3">

                    <Mail size={16} />

                    <span>cc.becm.ruet@gmail.com</span>

                  </div>

                  <div className="flex items-center gap-3">

                    <Phone size={16} />

                    <span>+880-2588867429</span>

                  </div>

                  {/* BUTTONS */}
                  <div className="flex flex-col gap-3 mt-2">

                    {/* VIEW MAP */}
                    <a
                      href="https://www.google.com/maps?q=24.363801508008894,88.62652878207071"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex
                        items-center
                        justify-between
                        gap-3
                        border-2
                        border-yellow-400
                        rounded-lg
                        px-4
                        py-2
                        hover:bg-yellow-400
                        hover:text-black
                        transition-all
                        font-semibold
                        text-sm
                      "
                    >

                      <div className="flex items-center gap-2">

                        <MapPin size={16} />

                        View on Map

                      </div>

                      <ChevronRight size={16} />

                    </a>

                    {/* SUPPORT US */}
                    <Link
                      href="/support"
                      className="
                        inline-flex
                        items-center
                        justify-between
                        gap-3
                        border-2
                        border-emerald-400
                        rounded-lg
                        px-4
                        py-2
                        bg-emerald-500/10
                        hover:bg-emerald-400
                        hover:text-black
                        transition-all
                        font-semibold
                        text-sm
                      "
                    >

                      <div className="flex items-center gap-2">

                        <HeartHandshake size={16} />

                        Support Us

                      </div>

                      <ChevronRight size={16} />

                    </Link>

                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="relative z-10 border-t border-white/10">

            <div
              className="
                px-6
                lg:px-8
                py-2
                flex
                flex-col
                md:flex-row
                items-center
                justify-between
                gap-2
                text-[11px]
                text-gray-300
              "
            >

              <p>© 2026 Construct Carnival. All Rights Reserved.</p>

              <p>Designed &amp; Developed by BECM, RUET.</p>

            </div>

          </div>
        </footer>

      </div>

    </div>
  );
}

export default FooterSection;
