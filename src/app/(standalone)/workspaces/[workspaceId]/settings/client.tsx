"use client";

import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";


export const WorkSpaceSettingsClient = () => {
    const workspaceId = useWorkSpaceId();
    const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

    if (isLoading) {
        return <PageLoader />;
    }

    if (!initialValues){
        return <PageError message="Project Settings not found" />
    }

    return (
        <div className="w-full lg:max-w-xl">
            <EditWorkspaceForm initialValues={initialValues} />
        </div>
    );
}