import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    image: z.string(),
    workspaceId: z.string()
});