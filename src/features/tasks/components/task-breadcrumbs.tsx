import { useRouter } from "next/navigation";
import Link from "next/link";

import { ChevronRightIcon, TrashIcon } from "lucide-react";

import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Project } from "@/features/projects/types";
import { Task } from "@/features/tasks/types";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { useDeleteTask } from "@/features/tasks/api/use-delete-task";

import { useConfirm } from "@/hooks/use-confirm";

import { Button } from "@/components/ui/button";

interface TaskBreadcrumbsProps {
    project: Project;
    task: Task;
}

export const TaskBreadcrumbs = ({
    project,
    task
}: TaskBreadcrumbsProps) => {
    const workspaceId = useWorkSpaceId();
    const router = useRouter();

    const { mutate, isPending } = useDeleteTask();
    const { ConfirmationDialog, confirm } = useConfirm(
        "Delete task",
        "This action cannot be undone",
        "destructive"
    );

    const handleDeleteTask = async () => {
        const ok = await confirm();
        if(!ok) return;

        mutate({
            param: { taskId: task.$id }
        }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks`);
            }
        })
    }

    return (
        <div className="flex items-center gap-x-2">
            <ConfirmationDialog />
            <ProjectAvatar 
                name={project?.name}
                image={project?.imageUrl}
                className="lg:size-8 size-6"
            />
            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
                    {project.name}
                </p>
            </Link>
            <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground" />
            <p className="text-sm lg:text-lg font-semibold">{project.name}</p>
            <Button
                className="ml-auto"
                variant={"destructive"}
                size={"sm"}
                onClick={handleDeleteTask}
                disabled={isPending}
            >
                <TrashIcon className="size-4 lg:mr-2" />
                <span className="hidden lg:block">Delete Task</span>
            </Button>
        </div>
    )
}