import { title } from "@/components/primitives";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center w-full mb-14">
      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className={title({ class: "text-[#0b4d44]" })}>
          About BECM
        </h1>
      </div>

      {/* Intro Box */}
      <div className="w-full bg-[#f5f5f5] border border-gray-200 rounded-[30px] px-6 md:px-12 py-8 shadow-sm mb-10">
        <p className="text-gray-600 text-lg leading-9 text-justify">
          Building Engineering & Construction Management (BECM) under the
          Faculty of Civil Engineering started its journey as a new department
          with 30 students in 2016 at RUET. Since its establishment, the
          department has been dedicated to producing skilled professionals
          equipped with modern knowledge in construction technology, project
          management, and sustainable infrastructure development. With a strong
          emphasis on academic excellence, practical learning, and industry
          collaboration, BECM continues to grow as a promising discipline
          contributing to the advancement of the construction sector in
          Bangladesh.
        </p>
      </div>

      {/* Main Image */}
      <div className="w-full overflow-hidden rounded-[30px] shadow-lg mb-10">
        <Image
          src="/gallery/image_16.jpg"
          alt="About BECM"
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
            Department Overview
          </h2>

          <div className="space-y-5 text-gray-600 text-justify leading-8">
            <p>
              The Department of Building Engineering & Construction Management
              functions as a center of teaching, learning, and research in the
              field of building technology, construction systems, building
              materials, and project management.
            </p>

            <p>
              As a developing and densely populated country, Bangladesh often
              faces challenges related to construction safety, sustainable
              infrastructure, proper project management, time efficiency, and
              structural guidance. BECM was established to address these modern
              engineering and construction challenges through advanced education
              and professional training.
            </p>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-[#f5f5f5] border border-gray-200 rounded-[28px] p-8 hover:shadow-lg transition duration-300">
          <h2 className="text-3xl font-bold text-[#0b4d44] text-center mb-6">
            Areas of Expertise
          </h2>

          <div className="text-gray-600 leading-8">
            <ul className="list-disc pl-6 space-y-3 text-justify">
              <li>
                Project management of distinctive and specialized projects
              </li>

              <li>
                Structural engineering for modern building structures
              </li>

              <li>
                Foundation engineering and construction safety management
              </li>

              <li>
                Earthquake engineering and seismic risk mitigation
              </li>

              <li>
                Architectural planning, design, and construction technology
              </li>

              <li>
                Building aesthetics and sustainable infrastructure development
              </li>

              <li>
                Digital management and smart building systems
              </li>

              <li>
                Resource optimization and economic construction planning
              </li>

              <li>
                HVAC control and environmental comfort systems
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}