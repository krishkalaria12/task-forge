import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { envKeys } from "@/lib/env";

import { getMember } from "@/features/members/utils";
import { Member, MemberRole } from "../types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            };

            const members = await databases.listDocuments<Member>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                [
                    Query.equal("workspaceId", workspaceId),
                ]
            );

            const populatedMembers = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    };
                })
            );

            return c.json({
                data: {
                    ...members,
                    documents: populatedMembers
                }
            })
        }
    )
    .delete(
        "/:memberId",
        sessionMiddleware,
        async (c) => {
            const { memberId } = c.req.param();
            const user = c.get("user");
            const databases = c.get("databases");

            const memberToDelete = await databases.getDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                memberId
            );

            const allMembersInWorkspace = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                [
                    Query.equal("workspaceId", memberToDelete.workspaceId),
                ]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToDelete.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN){
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            if (allMembersInWorkspace.total == 1){
                return c.json({ error: "Cannot delte the last member in the workspace" }, 400);
            }

            await databases.deleteDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                memberId
            );

            return c.json({
                data: { $id: memberToDelete.$id }
            })
        }
    )
    .patch(
        "/:memberId",
        sessionMiddleware,
        zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
        async (c) => {
            const { memberId } = c.req.param();
            const { role } = c.req.valid("json");
            const user = c.get("user");
            const databases = c.get("databases");

            const memberToUpdate = await databases.getDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                memberId
            );

            const allMembersInWorkspace = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                [
                    Query.equal("workspaceId", memberToUpdate.workspaceId),
                ]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            if (member.role !== MemberRole.ADMIN){
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            if (allMembersInWorkspace.total == 1){
                return c.json({ error: "Cannot downgrade the only member" }, 400);
            }

            await databases.updateDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                memberId,
                {
                    role,
                }
            );

            return c.json({
                data: { $id: memberToUpdate.$id }
            })
        }
    )

export default app;