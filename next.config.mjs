/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx"],
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
