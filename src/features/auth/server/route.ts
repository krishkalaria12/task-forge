import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@/features/auth/schemas";

const app = new Hono()
    .post(
        "/login", 
        zValidator("json", loginSchema) ,
        async (c) => {
            const { email, password } = await c.req.valid("json");
            console.log(email, password);
            return c.json({ email, password });
        }
    )
    .post(
        "/register",
        zValidator("json", registerSchema),
        async (c) => {
            const { email, password, name } = await c.req.valid("json");
            console.log(email, password, name);
            return c.json({ email, password, name });
        }
    )

export default app;