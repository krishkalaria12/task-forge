import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { sessionMiddleware } from "@/lib/session-middleware";
import { envKeys } from "@/lib/env";

import { WorkSpace } from "@/features/workspaces/types";
import { createWorkSpaceSchema, updateWorkSpaceSchema } from "@/features/workspaces/schemas";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/utils/generate-invite-code";
import { getMember } from "@/features/members/utils";
import { TaskStatus } from "@/features/tasks/types";

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
    .delete(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.param();

            const members = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!members || members.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // TODO: Delete all tasks, projects, members

            await databases.deleteDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionWorkspacesId,
                workspaceId
            );

            return c.json({
                data: { $id: workspaceId }
            })
        }
    )
    .post(
        "/:workspaceId/reset-invite-code",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.param();

            const members = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!members || members.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const workspace = await databases.updateDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionWorkspacesId,
                workspaceId,
                {
                    inviteCode: generateInviteCode(6),
                }
            );

            return c.json({
                data: workspace
            })
        }
    )
    .post(
        "/:workspaceId/join",
        sessionMiddleware,
        zValidator("json", z.object({ code : z.string() })),
        async (c) => {
            const { workspaceId } = c.req.param();
            const { code } = c.req.valid("json");

            const databases = c.get("databases");
            const user = c.get("user");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (member) {
                return c.json({ error: "Already a member" }, 400);
            }

            const workspace = await databases.getDocument<WorkSpace>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionWorkspacesId,
                workspaceId,
            );

            if (workspace.inviteCode.trim() !== code.trim()) {
                return c.json({ error: "Invalid invite code" }, 400);
            }

            await databases.createDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMBER
                }
            );

            return c.json({ data: workspace });
        }
    )
    .get(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { workspaceId } = c.req.param();
            
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });
            
            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            const workspace = await databases.getDocument<WorkSpace>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionWorkspacesId,
                workspaceId,
            );
            
            return c.json({ data: workspace });
        }
    )
    .get(
        "/:workspaceId/info",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const { workspaceId } = c.req.param();
            
            const workspace = await databases.getDocument<WorkSpace>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionWorkspacesId,
                workspaceId,
            );
            
            return c.json({ data: { $id: workspace.$id, name: workspace.name, imageUrl: workspace.imageUrl } });
        }
    )
    .get(
        "/:workspaceId/analytics",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));

            const thisMonthTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;

            const thisMonthAssigneedTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthAssigneedTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const assigneedTask = thisMonthAssigneedTasks.total;
            const assigneedTaskDifference = assigneedTask - lastMonthAssigneedTasks.total;

            const thisMonthIncompleteTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthIncompleteTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const incompleteTask = thisMonthIncompleteTasks.total;
            const incompleteTaskDifference = incompleteTask - lastMonthIncompleteTasks.total;

            const thisMonthCompleteTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthCompleteTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const completeTask = thisMonthCompleteTasks.total;
            const completeTaskDifference = completeTask - lastMonthCompleteTasks.total;

            const thisMonthOverdueTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthOverdueTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.lessThan("dueDate", now.toISOString()),
                    Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString())
                ]
            );

            const overdueTasks = thisMonthOverdueTasks.total;
            const overdueTaskDifference = overdueTasks - lastMonthOverdueTasks.total;

            return c.json({
                data: {
                    taskCount,
                    taskDifference,
                    assigneedTask,
                    assigneedTaskDifference,
                    completeTaskDifference,
                    completeTask,
                    overdueTasks,
                    overdueTaskDifference,
                    incompleteTask,
                    incompleteTaskDifference
                }
            })
        }
    )

export default app;