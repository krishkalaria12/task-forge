import { useRouter } from "next/navigation";

import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";

import { useDeleteTask } from "@/features/tasks/api/use-delete-task";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { useEditTaskModal } from "@/features/tasks/hooks/use-edit-task-modal";

import { useConfirm } from "@/hooks/use-confirm";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface taskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
}

export const TaskActions = ({
    children,
    id,
    projectId
}: taskActionsProps) => {
    const router = useRouter();
    const workspaceId = useWorkSpaceId();

    const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();

    const { ConfirmationDialog: DeleteTaskDialog, confirm: confirmDeleteTask } = useConfirm(
        "Delete task",
        "This action cannot be undone",
        "destructive"
    );

    const { open } = useEditTaskModal();

    const onDelete = async () => {
        const ok = await confirmDeleteTask();
        if (!ok) return;

        deleteTask({ param: { taskId: id } });
    }

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    }

    const onOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
    }

    return (
        <div className="flex justify-end">
            <DeleteTaskDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={onOpenTask}
                        className="font-medium p-[10px]"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onOpenProject}
                        className="font-medium p-[10px]"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => open(id)}
                        disabled={false}
                        className="font-medium p-[10px]"
                    >
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isDeletingTask}
                        className="font-medium p-[10px] text-amber-700 focus:text-amber-700"
                    >
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        Delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}