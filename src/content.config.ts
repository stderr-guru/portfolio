import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const work = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
    schema: z.object({
        year: z.string(),
        category: z.string(),
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
        order: z.number().optional(),
    }),
});

const writing = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
    schema: z.object({
        date: z.string(),
        readTime: z.string(),
        category: z.string(),
        title: z.string(),
        excerpt: z.string(),
        featured: z.boolean().default(false),
    }),
});

export const collections = { work, writing };
