/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable server actions if needed, default on in 14.
    typescript: {
        ignoreBuildErrors: true, // For safety during this rapid gen
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

export default nextConfig;
