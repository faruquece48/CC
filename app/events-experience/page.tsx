import { title } from "@/components/primitives";
import { galleryAsset } from "@/config/assets";

export default function EventsExperiencePage() {
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
            Events Experience
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
              Experience exciting competitions, networking opportunities
              and unforgettable moments from Construct Carnival events
              and activities. Engage with talented participants from
              different institutions, showcase your creativity and
              teamwork, and become part of a vibrant community driven by
              innovation and collaboration.
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
            src={galleryAsset("image_18.JPG")}
            alt="Events Experience"
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
              Competitions & Activities
            </h2>

            <p
              className="
                text-gray-600
                leading-8
                text-justify
              "
            >
              Construct Carnival brings together students from various
              universities across Bangladesh through exciting
              competitions, creative activities and interactive
              engineering events. Participants get the opportunity to
              showcase their technical expertise, innovation and
              teamwork skills.
            </p>

            <p
              className="
                text-gray-600
                leading-8
                text-justify
                mt-6
              "
            >
              The festival features events including CAD competitions,
              idea contests, project presentations, photography
              segments and management-based challenges designed to
              inspire future engineers and architects.
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
              Networking & Memories
            </h2>

            <p
              className="
                text-gray-600
                leading-8
                text-justify
              "
            >
              Beyond competitions, Construct Carnival creates a vibrant
              environment where students, teachers, researchers and
              professionals can connect and exchange ideas. The event
              encourages collaboration, friendship and knowledge
              sharing among participants from diverse academic fields.
            </p>

            <p
              className="
                text-gray-600
                leading-8
                text-justify
                mt-6
              "
            >
              Through cultural moments, team activities and inspiring
              interactions, participants gain unforgettable experiences
              and valuable connections that continue long after the
              festival concludes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
