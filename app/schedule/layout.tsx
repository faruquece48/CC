import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule | Construct Carnival 2.0",
  description: "View the upcoming Construct Carnival 2.0 schedule.",
};

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
