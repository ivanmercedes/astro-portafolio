import { defineCollection, z } from 'astro:content'

const collection = defineCollection({
  type: 'content',
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
})

export const collections = {
  posts: collection,
}