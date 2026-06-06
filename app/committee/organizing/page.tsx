'use client';

import { title } from "@/components/primitives";
import { Image } from "@nextui-org/react";

import commiteeList from "@/public/images/organizing_committee.png"
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col">
      <h1 className={title({ class: "mb-5" })}>Committee</h1>
      <Image onClick={() => {
        router.push("/committee/organizing_committee.pdf")
      }}
        src={commiteeList.src}
        alt="Organizing Committee List"
      />
    </div>
  );
}
