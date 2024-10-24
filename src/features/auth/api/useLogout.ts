import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>;

export const useLogout = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async () => {
            const response = await client.api.auth.logout["$post"]();

            if(!response.ok){
                throw new Error("Failed to log out");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Logged out successfully");
            window.location.href = "/sign-in";
            queryClient.invalidateQueries();
        },
        onError: () => {
            toast.error("Failed to log in");
        }
    });

    return mutation;
};