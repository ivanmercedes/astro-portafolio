import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    ogTitle: z.string().optional(),
    postDescription: z.string(),
    datePublished: z.string(),
    image: z.object({
      url: z.string().optional(),
      alt: z.string().optional(),
    }).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
});

export const collections = {
  posts,
  projects,
}