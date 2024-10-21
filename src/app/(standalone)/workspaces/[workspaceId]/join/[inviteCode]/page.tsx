import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries"
import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";

interface WorkSpaceIdJoinPageProps {
    params: {
        workspaceId: string;
    }
}

const WorkSpaceIdJoinPage = async ({
    params
}: WorkSpaceIdJoinPageProps) => {
    const user = await getCurrent();
    if(!user) redirect("/sign-in");

    const initialValues = await getWorkspaceInfo({
        workspaceId: params.workspaceId
    });

    if(!initialValues) redirect("/");

    return (
        <div className="w-full lg:max-w-xl">
            <JoinWorkspaceForm initialValues={initialValues} />
        </div>
    )
}

export default WorkSpaceIdJoinPage