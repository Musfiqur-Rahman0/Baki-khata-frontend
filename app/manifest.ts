import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "বাকি খাতা",
    short_name: "বাকি খাতা",
    description: "বাংলাদেশের ব্যবসার জন্য সহজ ডিজিটাল খাতা।",
    lang: "bn",
    start_url: "/store",
    scope: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#c25927",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
