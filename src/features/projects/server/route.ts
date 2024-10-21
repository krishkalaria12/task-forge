import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { envKeys } from "@/lib/env";

import { getMember } from "@/features/members/utils";
import { createProjectSchema } from "@/features/projects/schemas";

const app = new Hono()
    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createProjectSchema),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { name, image, workspaceId } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const project = await databases.createDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionProjectsId,
                ID.unique(),
                {
                    name,
                    imageUrl: image,
                    workspaceId,
                }
            );

            return c.json({ data: project });
        }
    )
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const { workspaceId } = c.req.valid("query");

            const user = c.get("user");
            const databases = c.get("databases");

            if (!workspaceId) {
                return c.json({ error: "Missing workspace id" }, 400);
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if(!member){
                return c.json({ error: "Unauthorized" }, 401);
            }

            const projects = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionProjectsId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt"),
                ]
            );

            return c.json({ data: projects });
        }
    )

export default app;