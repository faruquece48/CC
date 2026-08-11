import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate of Participation | Construct Carnival 2.0",
  description: "Preview a Construct Carnival 2.0 certificate of participation.",
};

export default function CertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
