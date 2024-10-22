"use client";

import { useParams } from "next/navigation";

export const useWorkSpaceId = () => {
    const params = useParams();
    return params.workspaceId as string;
}