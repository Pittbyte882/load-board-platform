/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',         // Required for next export
  trailingSlash: true,      // Optional: adds / to the end of URLs (e.g., /about/)
  images: {
    unoptimized: true       // Disable Image Optimization for export
  }
};

module.exports = nextConfig;
