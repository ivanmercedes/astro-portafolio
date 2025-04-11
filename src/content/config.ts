import { defineCollection, z } from 'astro:content'

const collection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    postDescription: z.string(),
    datePublished: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string().optional(),
    }),
  }),
})

export const collections = {
  posts: collection,
}