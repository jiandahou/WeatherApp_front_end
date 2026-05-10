import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "flagcdn.com",
          pathname: "/**",
        },
      ],
    },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);
