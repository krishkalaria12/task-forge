import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";
import {
    endOfMonth,
    startOfMonth,
    subMonths
} from "date-fns";

import { sessionMiddleware } from "@/lib/session-middleware";
import { envKeys } from "@/lib/env";

import { getMember } from "@/features/members/utils";
import { createProjectSchema, updateProjectSchema } from "@/features/projects/schemas";
import { Project } from "@/features/projects/types";
import { TaskStatus } from "@/features/tasks/types";

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

            const projects = await databases.listDocuments<Project>(
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
    .get(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { projectId } = c.req.param();

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

            return c.json({ data: existingProject });
        }
    )
    .get(
        "/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { projectId } = c.req.param();

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

            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));

            const thisMonthTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthAssigneedTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthIncompleteTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString())
                ]
            );

            const lastMonthCompleteTasks = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
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