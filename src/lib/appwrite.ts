import "server-only";

import { 
    Client,
    Account,
    // Storage,
    // Users,
    // Databases
} from "node-appwrite"

import { envKeys } from "@/lib/env"

export async function createAdminClient(){
    const client = new Client()
        .setEndpoint(envKeys.appwriteEndpoint)
        .setProject(envKeys.appwriteProjectId)
        .setKey(envKeys.appwriteApiKey);

    return {
        get account(){
            return new Account(client);
        },
    };
}