/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pg", "@veristat/db", "@veristat/shared"],
};

export default nextConfig;
