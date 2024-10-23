import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { envKeys } from "@/lib/env";
import { createAdminClient } from "@/lib/appwrite";

import { createTaskSchema } from "@/features/tasks/schemas";
import { getMember } from "@/features/members/utils";
import { Task, TaskStatus } from "@/features/tasks/types";
import { Project } from "@/features/projects/types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
                projectId: z.string().nullish(),
                assigneeId: z.string().nullish(),
                status: z.nativeEnum(TaskStatus).nullish(),
                dueDate: z.string().nullish(),
                search: z.string().nullish()
            })
        ),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");

            const {
                assigneeId,
                dueDate,
                projectId,
                status,
                workspaceId,
                search
            } = c.req.valid("query");
            
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });
        
            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            const query = [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt"),
            ];

            if (projectId){
                query.push(Query.equal("projectId", projectId));
            }

            if (status){
                query.push(Query.equal("status", status));
            }

            if (assigneeId){
                query.push(Query.equal("assigneeId", assigneeId));
            }

            if (dueDate){
                query.push(Query.equal("dueDate", dueDate));
            }

            if (search){
                query.push(Query.search("name", search));
            }

            const tasks = await databases.listDocuments<Task>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                query
            );
            
            const projectIds = tasks.documents.map((task) => task.projectId);
            const assigneeIds = tasks.documents.map((task) => task.assigneeId);

            const projects = await databases.listDocuments<Project>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionProjectsId,
                projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
            );

            const members = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
            );

            const assignees = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email
                    }
                })
            )

            const populatedTasks = tasks.documents.map((task) => {
                const project = projects.documents.find(
                    (project) => project.$id === task.projectId,
                );

                const assignee = assignees.find(
                    (assignee) => assignee.$id === task.assigneeId,
                );

                return {
                    ...task,
                    project,
                    assignee
                };
            });

            return c.json({
                data: {
                    ...tasks,
                    documents: populatedTasks,
                }
            })
        }
    )
    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createTaskSchema),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const {
                name,
                assigneeId,
                dueDate,
                projectId,
                status,
                workspaceId
            } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const highestPositionTask = await databases.listDocuments(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1),
                ]
            );

            const newPosition = highestPositionTask.documents.length > 0 ? highestPositionTask.documents[0].position + 1000 : 1000;

            const task = await databases.createDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId,
                    position: newPosition,
                }
            );

            return c.json({ data: task });
        }
    )
    .delete(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            await databases.deleteDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                taskId
            );

            return c.json({ data: { $id: task.$id } });
        }
    )
    .patch(
        "/:taskId",
        sessionMiddleware,
        zValidator("json", createTaskSchema.partial()),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const {
                name,
                assigneeId,
                dueDate,
                projectId,
                status,
                description
            } = c.req.valid("json");
            const { taskId } = c.req.param();

            const existingTask = await databases.getDocument<Task>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: existingTask.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const task = await databases.updateDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                taskId,
                {
                    name,
                    status,
                    projectId,
                    dueDate,
                    assigneeId,
                    description
                }
            );

            return c.json({ data: task });
        }
    )
    .get(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const { taskId } = c.req.param();

            const databases = c.get("databases");
            const currentUser = c.get("user");
            const { users } = await createAdminClient();

            const task = await databases.getDocument<Task>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionTasksId,
                taskId
            );

            const currentMember = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: currentUser.$id,
            });

            if (!currentMember) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const project = await databases.getDocument<Project>(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionProjectsId,
                task.projectId
            );

            const member = await databases.getDocument(
                envKeys.appwriteDatabaseId,
                envKeys.appwriteCollectionMembersId,
                task.assigneeId
            );

            const user = await users.get(member.userId);

            const assignee = {
                ...member,
                name: user.name,
                email: user.email,
            };
            
            return c.json({ 
                data: {
                    ...task,
                    project,
                    assignee
                }
            });
        }
    )

export default app;