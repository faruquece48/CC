import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Schedule | CE Carnival",
  description: "The complete CE Carnival event schedule and session timings.",
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
