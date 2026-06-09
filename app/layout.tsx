import "@/styles/globals.css";
import { Metadata } from "next";
import Script from "next/script";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";
import PopunderAd from "@/components/PopunderAd";

import clsx from "clsx";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FYPHLVD3YK"
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              dataLayer.push(arguments);
            }

            gtag('js', new Date());

            gtag('config', 'G-FYPHLVD3YK');
          `}
        </Script>
      </head>

      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased m-0 p-0 overflow-x-hidden",
          fontSans.variable
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
          }}
        >
          <div className="relative flex flex-col min-h-screen">
            {/* NAVBAR */}
            <Navbar />

            {/* MAIN CONTENT */}
            <main className="w-full flex-grow">
              {children}
            </main>

            {/* FOOTER */}
            <footer className="w-full flex items-center justify-center">
              <FooterSection />
            </footer>
          </div>
        </Providers>

        {/* Controlled Adsterra Popunder */}
        <PopunderAd />
      </body>
    </html>
  );
}