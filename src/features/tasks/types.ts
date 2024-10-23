import { Models } from "node-appwrite"

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    TODO = "TODO",
    DONE = "DONE"
}

export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    description?: string;
    dueDate: string;
    projectId: string;
    assigneeId: string;
    position: number;
    workspaceId: string;
}