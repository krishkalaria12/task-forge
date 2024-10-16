import { cookies } from "next/headers";

import { Account, Client, Databases, Query } from "node-appwrite";

import { envKeys } from "@/lib/env";
import { AUTH_COOKIE } from "@/features/auth/constants";

export const getWorkspaces = async () => {
    try {
        const client = new Client()
                .setEndpoint(envKeys.appwriteEndpoint)
                .setProject(envKeys.appwriteProjectId);
        
        const session = await cookies().get(AUTH_COOKIE);
    
        if(!session) return { documents: [], total: 0 };
    
        client.setSession(session.value);
        const databases = new Databases(client);
        const account = new Account(client);
        const user = await account.get();

        const members = await databases.listDocuments(
            envKeys.appwriteDatabaseId,
            envKeys.appwriteCollectionMembersId,
            [
                Query.equal("userId", user.$id),
            ]
        );

        if(members.total == 0){
            return { documents: [], total: 0 };
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
    
        return workspaces;
    } catch {
        return { documents: [], total: 0 };
    }
}