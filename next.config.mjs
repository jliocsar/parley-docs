import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: [process.env.NEXT_CUSTOM_ALLOWED_DEV_ORIGINS],
};

export default withMDX(config);
