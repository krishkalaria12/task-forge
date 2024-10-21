import "server-only";

import { cookies } from "next/headers";
import { 
    Client,
    Account,
    Databases,
    Users,
    // Storage,
} from "node-appwrite"

import { envKeys } from "@/lib/env"
import { AUTH_COOKIE } from "@/features/auth/constants";

export async function createSessionClient() {
    const client = new Client()
        .setEndpoint(envKeys.appwriteEndpoint)
        .setProject(envKeys.appwriteProjectId);

    const session = await cookies().get(AUTH_COOKIE);

    if (!session || !session.value) {
        throw new Error("Unauthorized");
    }

    client.setSession(session.value);

    return {
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client);
        },
    }
}

export async function createAdminClient(){
    const client = new Client()
        .setEndpoint(envKeys.appwriteEndpoint)
        .setProject(envKeys.appwriteProjectId)
        .setKey(envKeys.appwriteApiKey);

    return {
        get account(){
            return new Account(client);
        },
        get users(){
            return new Users(client);
        },
    };
}