import type { Metadata } from "next";
import "@fontsource/great-vibes/400.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/400-italic.css";
import "@fontsource/lora/700.css";

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
