/** @type {import('next').NextConfig} */
const nextConfig = {
  // ignore typescript errors. The global typecheck script will catch them
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
  },
  // ignore eslint errors. The global lint script will catch them
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
