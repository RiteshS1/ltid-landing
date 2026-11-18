import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LTID — Digital Agricultural Cooperative",
    short_name: "LTID",
    description: "Finance × distribution × AI for farmers in developing countries.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe2",
    theme_color: "#0a2118",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
