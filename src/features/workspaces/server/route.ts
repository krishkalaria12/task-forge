import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { envKeys } from "@/lib/env";

import { createWorkSpaceSchema } from "@/features/workspaces/schemas";

const app = new Hono()
    .post(
        "/",
        zValidator("json", createWorkSpaceSchema),
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { name, image } = c.req.valid("json");

            const workspace = await databases.createDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionWorkspacesId,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: image,
                }
            );

            return c.json({ data: workspace });
        }
    )

export default app;