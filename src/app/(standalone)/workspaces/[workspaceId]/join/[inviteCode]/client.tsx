import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";

export const WorkSpaceIdJoinClient = () => {
    const workspaceId = useWorkSpaceId();
    const { data: initialValues, isLoading } = useGetWorkspaceInfo({ workspaceId });

    if (isLoading) {
        return <PageLoader />;
    }

    if (!initialValues){
        return <PageError message="Project Settings not found" />
    }

    return (
        <div className="w-full lg:max-w-xl">
            <JoinWorkspaceForm initialValues={initialValues} />
        </div>
    );
}