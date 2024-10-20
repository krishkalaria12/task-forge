import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { envKeys } from "@/lib/env";

import { createWorkSpaceSchema, updateWorkSpaceSchema } from "@/features/workspaces/schemas";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/utils/generate-invite-code";
import { getMember } from "@/features/members/utils";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const members = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                [
                    Query.equal("userId", user.$id),
                ]
            );

            if(members.total == 0){
                return c.json({ data: { documents: [], total: 0 } });
            }

            const workspaceIds = members.documents.map((member) => member.workspaceId);

            const workspaces = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionWorkspacesId,
                [
                    Query.orderDesc("$createdAt"),
                    Query.contains("$id", workspaceIds),
                ],
            );

            return c.json({ data: workspaces });
        }
    )
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
                    inviteCode: generateInviteCode(6),
                }
            );

            await databases.createDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                ID.unique(),
                {
                    workspaceId: workspace.$id,
                    userId: user.$id,
                    role: MemberRole.ADMIN
                }
            )

            return c.json({ data: workspace });
        }
    )
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("json", updateWorkSpaceSchema),
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.param();
            const { name, image } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const workspace = await databases.updateDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionWorkspacesId,
                workspaceId,
                {
                    name,
                    imageUrl: image,
                }
            );

            return c.json({ data: workspace });
        }
    )

export default app;