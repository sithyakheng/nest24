import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https://res.cloudinary.com https://*.cloudinary.com https://*.supabase.co data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://res.cloudinary.com https://api.cloudinary.com;"
  }
];

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/.env:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
      {
        source: '/.git/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/.env',
        destination: '/',
        permanent: false,
      },
      {
        source: '/.git/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/wp-config.php',
        destination: '/',
        permanent: false,
      },
      {
        source: '/.env:path*',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default withPWA(nextConfig);
