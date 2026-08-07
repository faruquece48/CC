import { title } from "@/components/primitives";
import Image from "next/image";
import { galleryAsset } from "@/config/assets";

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center w-full mb-14">
      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className={title({ class: "text-[#0b4d44]" })}>
          Message From Head
        </h1>
      </div>

      {/* Intro Box */}
      <div className="w-full bg-[#f5f5f5] border border-gray-200 rounded-[30px] px-6 md:px-12 py-8 shadow-sm mb-10">
        <p className="text-gray-600 text-lg leading-9 text-justify">
          Welcome to the Department of Building Engineering & Construction
          Management (BECM). As a developing and densely populated country,
          Bangladesh often faces challenges related to construction safety,
          sustainable infrastructure, and effective construction management
          practices. To address these growing demands, the BECM department is
          committed to developing competent professionals with strong technical
          knowledge, managerial expertise, and innovative problem-solving
          abilities. Through quality education, practical exposure, and
          research-oriented activities, the department strives to contribute
          toward safer, smarter, and more sustainable development in the
          construction industry.
        </p>
      </div>

      {/* Message Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left Side - Head Profile */}
        <div className="bg-[#f5f5f5] border border-gray-200 rounded-[28px] p-8 shadow-sm flex flex-col items-center text-center">
          {/* Profile Image */}
          <div className="w-full max-w-[280px] overflow-hidden rounded-[24px] mb-6 shadow-md bg-white">
            <Image
              src={galleryAsset("head.jpg")}
              unoptimized
              alt="Shayla Sharmin"
              width={700}
              height={900}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Name & Designation */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0b4d44] leading-snug">
              Shayla Sharmin
            </h2>

            <p className="text-gray-500 font-medium text-lg">
              Head of BECM, RUET
            </p>
          </div>

          {/* Divider */}
          <div className="w-24 h-1 bg-[#0b4d44] rounded-full my-6" />

          {/* Short Bio */}
          <p className="text-gray-600 leading-8 text-justify">
            Dedicated to academic excellence, innovative research, and
            sustainable infrastructure development, the department continues to
            inspire future engineers and project leaders through quality
            education, technical expertise, and industry-focused learning.
          </p>
        </div>

        {/* Right Side - Message */}
        <div className="lg:col-span-2 bg-[#f5f5f5] border border-gray-200 rounded-[28px] p-8 hover:shadow-lg transition duration-300">
          <h2 className="text-3xl font-bold text-[#0b4d44] text-center mb-6">
            Vision & Commitment
          </h2>

          <div className="space-y-5 text-gray-600 text-justify leading-8">
            <p>
              Bangladesh, as a developing and densely populated country, often
              faces challenges related to construction safety, sustainable
              infrastructure, proper construction management, time efficiency,
              and professional structural guidance. Building Engineering &
              Construction Management offers an effective solution by integrating
              Civil Engineering, Architectural Design, and Construction
              Management into a unified discipline.
            </p>

            <p>
              Since its establishment in 2016 under the Faculty of Civil
              Engineering, the department has remained committed to spreading
              reliable knowledge, technical expertise, and innovative methods
              that support green buildings, high-rise structures, and modern
              sustainable development practices.
            </p>

            <p>
              The department currently offers the B.Sc. Engineering degree and
              enrolls 30 meritorious students each year. Faculty members are
              continuously working to strengthen the department through quality
              teaching, research activities, innovative learning methods, and
              practical exposure.
            </p>

            <p>
              Teachers and students are equally devoted to enhancing their
              research and technical skills to meet modern industry demands. The
              vision of the department is to produce highly competent graduates
              who can establish themselves as specialists, innovators, and
              future project leaders in the era of sustainable development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
