import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  env: {
    NEXT_PUBLIC_OPENROUTER_KEY: process.env.NEXT_PUBLIC_OPENROUTER_KEY
  }
};


export default nextConfig;
