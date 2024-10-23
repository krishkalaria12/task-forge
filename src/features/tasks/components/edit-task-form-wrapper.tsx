import { Loader } from "lucide-react";

import { 
    Card, 
    CardContent 
} from "@/components/ui/card";

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { EditTaskForm } from "@/features/tasks/components/edit-task-form";

interface editTaskFormWrapperProps {
    onCancel: () => void;
    id: string;
}

export const EditTaskFormWrapper = ({
    onCancel,
    id
}: editTaskFormWrapperProps) => {
    const workspaceId = useWorkSpaceId();

    const { data: initialValues, isLoading: isLoadingTask } = useGetTask({
        taskId: id
    });

    const { data: projects, isLoading: isProjectsLoading } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isMembersLoading } = useGetMembers({ workspaceId });

    const projectOptions = projects?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl
    }));

    const memberOptions = members?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
    }));

    const isLoading = isProjectsLoading || isMembersLoading || isLoadingTask;

    if (isLoading) {
        return (
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (!initialValues) return null;

    return (
        <EditTaskForm
            initialValues={initialValues}
            onCancel={onCancel}
            projectOptions={projectOptions ?? []}
            memberOptions={memberOptions ?? []}
        />
    )
}