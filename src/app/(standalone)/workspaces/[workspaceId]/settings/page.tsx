import { getCurrent } from "@/features/auth/queries"
import { getWorkspace } from "@/features/workspaces/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { redirect } from "next/navigation";

interface WorkSpaceSettingsPageProps {
    params: {
        workspaceId: string;
    }
}

const WorkSpaceSettingsPage = async ({
    params
}: WorkSpaceSettingsPageProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const initialValues = await getWorkspace({ workspaceId: params.workspaceId });

    if (!initialValues) {
        redirect(`/workspaces/${params.workspaceId}`);
    }

    return (
        <div className="w-full lg:max-w-xl">
            <EditWorkspaceForm initialValues={initialValues} />
        </div>
    );
};

export default WorkSpaceSettingsPage