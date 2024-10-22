import { createSessionClient } from "@/lib/appwrite";
import { envKeys } from "@/lib/env";

import { getMember } from "../members/utils";
import { Project } from "@/features/projects/types";

interface getProjectProps {
    projectId: string;
}

export const getProject = async ({ projectId }: getProjectProps) => {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    const project = await databases.getDocument<Project>(
        envKeys.appwriteDatabaseId,
        envKeys.appwriteCollectionProjectsId,
        projectId
    );

    const member = await getMember({
        databases,
        workspaceId: project.workspaceId,
        userId: user.$id,
    });

    if (!member) {
        throw new Error("Unauthorized");
    }

    return project;
};
