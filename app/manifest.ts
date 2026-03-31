import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Phetchabun Adventure",
    short_name: "PhetGame",
    display: "standalone",
    start_url: "/",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
