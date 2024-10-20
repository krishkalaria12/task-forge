import { Models } from "node-appwrite";

export type WorkSpace = Models.Document & {
    name: string;
    imageUrl?: string;
    inviteCode: string;
    userId: string;
}