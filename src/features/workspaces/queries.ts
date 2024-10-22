import { Query } from "node-appwrite";

import { getMember } from "@/features/members/utils";
import { WorkSpace } from "@/features/workspaces/types";

import { envKeys } from "@/lib/env";
import { createSessionClient } from "@/lib/appwrite";

export const getWorkspaces = async () => {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    const members = await databases.listDocuments(
        envKeys.appwriteDatabaseId,
        envKeys.appwriteCollectionMembersId,
        [Query.equal("userId", user.$id)]
    );

    if (members.total == 0) {
        return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
        envKeys.appwriteDatabaseId,
        envKeys.appwriteCollectionWorkspacesId,
        [Query.orderDesc("$createdAt"), Query.contains("$id", workspaceIds)]
    );

    return workspaces;
};

interface getWorkspaceProps {
    workspaceId: string;
}

export const getWorkspace = async ({
    workspaceId,
}: getWorkspaceProps): Promise<WorkSpace | null> => {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    const member = await getMember({
        databases,
        workspaceId: workspaceId,
        userId: user.$id,
    });

    if (!member) {
        throw new Error("Unauthorized");
    }

    const workspace = await databases.getDocument<WorkSpace>(
        envKeys.appwriteDatabaseId,
        envKeys.appwriteCollectionWorkspacesId,
        workspaceId
    );

    return workspace;
};

interface getWorkspaceInfoProps {
    workspaceId: string;
}

export const getWorkspaceInfo = async ({
    workspaceId,
}: getWorkspaceInfoProps) => {
    const { databases } = await createSessionClient();

    const workspace = await databases.getDocument<WorkSpace>(
        envKeys.appwriteDatabaseId,
        envKeys.appwriteCollectionWorkspacesId,
        workspaceId
    );

    return {
        name: workspace.name,
    };
};