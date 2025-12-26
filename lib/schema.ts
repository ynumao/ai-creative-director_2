import { z } from "zod";

export const ComponentSchema = z.object({
    type: z.enum(["header", "hero", "features", "testimonials", "pricing", "faq", "cta", "footer", "text_section", "image_section"]),
    title: z.string(),
    content: z.string().describe("Main text content for this section"),
    imagePrompt: z.string().optional().describe("Prompt for generating an image for this section, if applicable"),
    style: z.object({
        backgroundColor: z.string().optional(),
        textColor: z.string().optional(),
        layout: z.string().optional(),
    }).optional(),
});

export const LPStructureSchema = z.object({
    meta: z.object({
        title: z.string(),
        description: z.string(),
    }),
    sections: z.array(ComponentSchema),
});

export type LPStructure = z.infer<typeof LPStructureSchema>;
