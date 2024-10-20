import { Query, type Databases } from "node-appwrite";

import { envKeys } from "@/lib/env";

interface GetMemberProps {
    databases: Databases;
    workspaceId: string;
    userId: string;
}

export const getMember = async ({
    databases,
    workspaceId,
    userId,
}: GetMemberProps) => {
    const members = await databases.listDocuments(
        envKeys.appwriteDatabaseId,
        envKeys.appwriteCollectionMembersId,
        [
            Query.equal("workspaceId", workspaceId),
            Query.equal("userId", userId),
        ]
    );

    return members.documents[0];
}