import { useRouter } from "next/navigation";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Member } from "@/features/members/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Project } from "@/features/projects/types";
import { TaskStatus } from "@/features/tasks/types";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import { cn } from "@/lib/utils";

interface EventCardProps {
    title: string;
    assignee: Member;
    project: Project;
    status: TaskStatus;
    id: string;
}

const statusColorMap: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG] : "border-l-pink-500",
    [TaskStatus.TODO] : "border-l-red-500",
    [TaskStatus.IN_PROGRESS] : "border-l-yellow-500",
    [TaskStatus.IN_REVIEW] : "border-l-blue-500",
    [TaskStatus.DONE] : "border-l-emerald-500",
};

export const EventCard = ({
    assignee,
    id,
    project,
    status,
    title
}: EventCardProps) => {
    const workspaceId = useWorkSpaceId();
    const router = useRouter();

    const onClick = (e : React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    };

    return (
        <div className="px-2">
            <div onClick={onClick} className={cn(
                "p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition min-h-[100px]",
                statusColorMap[status]
            )}>
                <p>{title}</p>
                <div className="flex items-center gap-x-1">
                    <MemberAvatar 
                        name={assignee?.name}
                    />
                </div>
                <div className="size-1 rounded-full bg-neutral-300">
                    <ProjectAvatar 
                        name={project?.name}
                        image={project?.imageUrl}
                    />
                </div>
            </div>
        </div>
    )
}