import { cookies } from "next/headers";

import { Account, Client } from "node-appwrite";

import { envKeys } from "@/lib/env";
import { AUTH_COOKIE } from "@/features/auth/constants";

export const getCurrent = async () => {
    try {
        const client = new Client()
                .setEndpoint(envKeys.appwriteEndpoint)
                .setProject(envKeys.appwriteProjectId);
        
        const session = await cookies().get(AUTH_COOKIE);
    
        if(!session) return null;
    
        client.setSession(session.value);
        const account = new Account(client);
    
        return await account.get();
    } catch {
        return null;
    }
}