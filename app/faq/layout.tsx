import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Construct Carnival",
  description: "Answers about Construct Carnival registration, events, teams, payments, OTP verification, and support."
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
