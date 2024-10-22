import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    image: z.string().optional(),
    workspaceId: z.string()
});

export const updateProjectSchema = z.object({
    name: z.string().trim().min(1, "Required").optional(),
    image: z.string().optional(),
});