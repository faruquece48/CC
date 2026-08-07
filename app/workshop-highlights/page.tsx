import { title } from "@/components/primitives";
import { galleryAsset } from "@/config/assets";

export default function WorkshopHighlightsPage() {
  return (
    <div className="w-full px-4 lg:px-10 py-10 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* TOP CONTENT */}
        <div className="text-center mb-12">
          <h1
            className={title({
              class:
                "text-[#083d35] text-4xl lg:text-6xl font-bold",
            })}
          >
            Workshop Highlights
          </h1>

          {/* Intro Border Box */}
          <div
            className="
              mt-6
              bg-[#f8faf9]
              border
              border-gray-200
              rounded-[28px]
              px-6
              md:px-10
              py-6
              max-w-5xl
              mx-auto
              shadow-sm
            "
          >
            <p
              className="
                text-gray-600
                text-lg
                leading-9
                text-justify
              "
            >
              Explore inspiring technical workshops, hands-on learning
              sessions and industry-focused experiences at Construct
              Carnival. Participants will have the opportunity to
              interact with experts, enhance practical skills and gain
              valuable insights into modern construction technologies and
              management practices.
            </p>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div
          className="
            w-full
            h-[260px]
            md:h-[420px]
            rounded-[32px]
            overflow-hidden
            shadow-lg
            mb-14
          "
        >
          <img
            src={galleryAsset("image_17.JPG")}
            alt="Workshop Highlights"
            className="w-full h-full object-cover"
          />
        </div>

        {/* CONTENT SECTION */}
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-10
          "
        >
          {/* LEFT CONTENT */}
          <div
            className="
              bg-[#f8faf9]
              rounded-3xl
              border
              border-gray-200
              p-8
              shadow-sm
            "
          >
            <h2
              className="
                text-3xl
                font-bold
                text-[#083d35]
                mb-6
                text-center
              "
            >
              Technical Learning Sessions
            </h2>

            <p
              className="
                text-gray-600
                leading-8
                text-justify
              "
            >
              Construct Carnival provides students with the opportunity
              to participate in hands-on workshops conducted by industry
              professionals, researchers and experienced faculty members.
              These sessions are designed to strengthen technical
              knowledge and practical engineering skills through
              interactive learning experiences.
            </p>

            <p
              className="
                text-gray-600
                leading-8
                text-justify
                mt-6
              "
            >
              Participants gain exposure to modern construction
              technologies, project management techniques, design tools
              and sustainable engineering practices that help prepare
              them for future professional challenges.
            </p>
          </div>

          {/* RIGHT CONTENT */}
          <div
            className="
              bg-[#f8faf9]
              rounded-3xl
              border
              border-gray-200
              p-8
              shadow-sm
            "
          >
            <h2
              className="
                text-3xl
                font-bold
                text-[#083d35]
                mb-6
                text-center
              "
            >
              Industry Experience
            </h2>

            <p
              className="
                text-gray-600
                leading-8
                text-justify
              "
            >
              The workshops encourage collaboration between students,
              educators and industry experts, creating a platform for
              innovation and knowledge exchange. Students can learn about
              current industry trends, advanced software tools and
              real-world engineering applications.
            </p>

            <p
              className="
                text-gray-600
                leading-8
                text-justify
                mt-6
              "
            >
              Through these engaging sessions, participants develop
              confidence, teamwork abilities and problem-solving skills
              essential for success in engineering and construction
              management careers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
