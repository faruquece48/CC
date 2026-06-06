import { title } from "@/components/primitives";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center w-full mb-14">
      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className={title({ class: "text-[#0b4d44]" })}>
          About Construct Carnival
        </h1>
      </div>

      {/* Intro Box */}
      <div className="w-full bg-[#f5f5f5] border border-gray-200 rounded-[30px] px-6 md:px-12 py-8 shadow-sm mb-10">
        <p className="text-gray-600 text-lg leading-9 text-justify">
          The Construct Carnival stands as a beacon of innovation and
          excellence, orchestrated by the esteemed Department of Building
          Engineering and Construction Management (BECM) at RUET. This flagship
          event brings together aspiring engineers, architects, researchers,
          industry professionals, and creative minds from across the country to
          celebrate the spirit of construction, technology, and sustainable
          development.
        </p>
      </div>

      {/* Main Image */}
      <div className="w-full overflow-hidden rounded-[30px] shadow-lg mb-10">
        <Image
          src="/gallery/image_11.JPG"
          alt="Construct Carnival"
          width={1600}
          height={900}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Left Card */}
        <div className="bg-[#f5f5f5] border border-gray-200 rounded-[28px] p-8 hover:shadow-lg transition duration-300">
          <h2 className="text-3xl font-bold text-[#0b4d44] text-center mb-6">
            Festival Overview
          </h2>

          <div className="space-y-5 text-gray-600 text-justify leading-8">
            <p>
              Construct Carnival 1.0 is a nationwide festival for students
              studying Civil Engineering, Building Engineering & Construction
              Management, Urban & Regional Planning, and Architecture. The
              festival is organized by the Department of Building Engineering &
              Construction Management at Rajshahi University of Engineering &
              Technology (RUET).
            </p>

            <p>
              The event aims to inspire students by providing a dynamic platform
              for creativity, innovation, technical learning, and collaboration.
              It encourages participants to apply their academic knowledge in
              practical and competitive environments.
            </p>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-[#f5f5f5] border border-gray-200 rounded-[28px] p-8 hover:shadow-lg transition duration-300">
          <h2 className="text-3xl font-bold text-[#0b4d44] text-center mb-6">
            Competitions & Networking
          </h2>

          <div className="space-y-5 text-gray-600 text-justify leading-8">
            <p>
              Construct Carnival features exciting competitions including CAD
              Expert, Render Rampage, Mechamind, Idea Contest, Poster
              Presentation, Archi Capture, and Smart Management Maestro.
              Students from universities across Bangladesh can participate in
              these events to enhance their professional and technical skills.
            </p>

            <p>
              Beyond competitions, the festival creates opportunities for
              students, teachers, researchers, and professionals to exchange
              knowledge, build connections, and explore innovative ideas related
              to engineering, planning, architecture, and construction
              management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}