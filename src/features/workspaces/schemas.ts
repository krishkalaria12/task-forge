import { z } from "zod";

export const createWorkSpaceSchema = z.object({
    name: z.string().trim().min(1, "Must be 1 or more characters"),
    image: z.string().optional(),
});

export const updateWorkSpaceSchema = z.object({
    name: z.string().trim().min(1, "Must be 1 or more characters").optional(),
    image: z.string().optional(),
});