import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ID } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";

import { loginSchema, registerSchema } from "@/features/auth/schemas";
import { createAdminClient } from "@/lib/appwrite";
import { AUTH_COOKIE } from "../constants";

const app = new Hono()
    .post(
        "/login", 
        zValidator("json", loginSchema) ,
        async (c) => {
            const { email, password } = await c.req.valid("json");

            const { account } = await createAdminClient();

            const session = await account.createEmailPasswordSession(
                email,
                password
            );

            setCookie(c, AUTH_COOKIE, session.secret, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60*60*24*30,
            });

            return c.json({ success: true });
        }
    )
    .post(
        "/register",
        zValidator("json", registerSchema),
        async (c) => {
            const { email, password, name } = await c.req.valid("json");

            const { account } = await createAdminClient();

            await account.create(
                ID.unique(),
                email, 
                password,
                name
            );

            const session = await account.createEmailPasswordSession(
                email,
                password
            );

            setCookie(c, AUTH_COOKIE, session.secret, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60*60*24*30,
            });

            return c.json({ success: true });
        }
    )
    .post(
        "/logout",
        (c) => {
            deleteCookie(c , AUTH_COOKIE);

            return c.json({ success: true });
        }
    )   

export default app;