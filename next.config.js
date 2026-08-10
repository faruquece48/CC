/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // PDFKit reads its built-in fonts at runtime, so Vercel must bundle them
    // with the serverless functions that generate payment-slip PDFs.
    outputFileTracingIncludes: {
      "/api/payment-confirmation-email": ["./node_modules/pdfkit/js/data/*.afm"],
      "/api/test-payment-email": ["./node_modules/pdfkit/js/data/*.afm"],
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
