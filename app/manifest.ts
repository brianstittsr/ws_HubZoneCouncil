import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HUBZone on the Rise | 2026 National HUBZone Conference",
    short_name: "HUBZone on the Rise",
    description:
      "Official conference platform for the 2026 National HUBZone Conference, July 21-22, 2026 in Chantilly, Virginia. Register, explore speakers, and connect.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a2b4a",
    theme_color: "#c9a227",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo.jpg",
        sizes: "any",
        type: "image/jpeg",
      },
    ],
    categories: ["business", "productivity"],
    lang: "en-US",
    dir: "ltr",
  };
}
