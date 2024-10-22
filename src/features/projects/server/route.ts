import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { envKeys } from "@/lib/env";

import { getMember } from "@/features/members/utils";
import { createProjectSchema, updateProjectSchema } from "@/features/projects/schemas";
import { Project } from "@/features/projects/types";

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
    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("json", updateProjectSchema),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { projectId } = c.req.param();
            const { name, image } = c.req.valid("json");

            const existingProject = await databases.getDocument<Project>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionProjectsId,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const updatedProject = await databases.updateDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionProjectsId,
                projectId,
                {
                    name,
                    imageUrl: image,
                }
            );

            return c.json({ data: updatedProject });
        }
    )
    .delete(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { projectId } = c.req.param();

            const existingProject = await databases.getDocument<Project>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionProjectsId,
                projectId
            )

            const members = await getMember({
                databases,
                workspaceId: existingProject.workspaceId,
                userId: user.$id
            });

            if (!members) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // TODO: Delete Tasks

            await databases.deleteDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionProjectsId,
                projectId
            );

            return c.json({
                data: { $id: existingProject.$id }
            })
        }
    )

export default app;