import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const devOrigin = process.env.NEXT_CUSTOM_ALLOWED_DEV_ORIGINS;

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  allowedDevOrigins: devOrigin ? [devOrigin] : [],
};

initOpenNextCloudflareForDev();

export default withMDX(config);
