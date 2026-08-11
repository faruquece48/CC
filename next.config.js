/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdfkit"],
    // PDFKit reads its built-in fonts at runtime, so Vercel must bundle them
    // with the serverless functions that generate payment-slip PDFs.
    outputFileTracingIncludes: {
      "/*": [
        "./node_modules/pdfkit/js/data/**/*",
        "./node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf",
        "./node_modules/@fontsource/inter/files/inter-latin-*.woff",
        "./node_modules/@fontsource/lora/files/lora-latin-*.woff",
        "./node_modules/@fontsource/great-vibes/files/great-vibes-latin-*.woff",
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.ruet.ac.bd',
        pathname: '/public/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'images.constructcarnival.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://constructcarnival.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
