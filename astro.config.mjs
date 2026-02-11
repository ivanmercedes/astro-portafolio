import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  site: "https://ivanmercedes.com",
  base: "/",
  integrations: [tailwind(), react(), sitemap(), robotsTxt()],
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://shiki.style/themes
      theme: "catppuccin-mocha",
      // Alternatively, provide multiple themes
      // See note below for using dual light/dark themes
      // themes: {
      //   light: 'github-light',
      //   dark: 'github-dark'
      // },
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://shiki.style/languages
      langs: [
        "php",
        "python",
        "javascript",
        "typescript",
        "css",
        "html",
        "json",
        "yaml",
        "markdown",
        "bash",
      ],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
      // Add custom transformers: https://shiki.style/guide/transformers
      // Find common transformers: https://shiki.style/packages/transformers
      transformers: [],
    },
  },
});
