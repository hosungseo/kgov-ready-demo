import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "K-Gov Agent-Ready 시안",
    short_name: "K-Gov AR",
    description: "19개 중앙부처를 AI 에이전트용으로 다시 짠 시안",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#0b2e5a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
