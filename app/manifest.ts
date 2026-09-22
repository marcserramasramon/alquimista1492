import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Els Guardians del Secret de Sentfores",
    short_name: "Guardians",
    description: "Escape room exterior a Sentfores–La Guixa",
    start_url: "/",
    display: "standalone",
    background_color: "#f4ebd9",
    theme_color: "#f4ebd9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
