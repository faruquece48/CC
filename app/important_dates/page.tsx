"use client";

import { title } from "@/components/primitives";
import { Timer } from "@/components/timer";

import { Image } from "@nextui-org/react";

import commiteeList from "@/public/images/Schedule.png";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col">
      {/* <h1 className={title({ class: "mb-5" })}> Important Dates </h1> */}

      {/* <h1 className="text-lg text-center font-bold  ">
        <br /> */}
        {/* <Timer /> */}
      {/* </h1> */}
      {/* <h1 className="text-lg text-center font-bold text-red-600">
        Registration closes at 24 May, 2024!
      </h1> */}

      {/* <br /> */}
      {/* <h1 className={title({ class: "mb-1 mt-5" })}>Program Schedule</h1> */}
      <Image
        onClick={() => {
          router.push("/committee/schedule.pdf");
        }}
        src={commiteeList.src}
        alt="Organizing Committee List"
      />
    </div>
  );
}

// export default function AboutPage() {
//   return (
// <div className="flex flex-col">
//   <h1 className={title({ class: "mb-5" })}> Important Dates </h1>
//   <div className="text-lg text-justify ">
//     <h1 className="text-lg text-center font-bold">
//       Registration Starts at 07 May, 2024
//     </h1>
//   </div>
// <br />
// <Timer />
// <br />
// <h1 className="text-lg text-center font-bold text-red-600">
//   Registration closes at 24 May, 2024!
// </h1>
// </div>
//   );
// }
