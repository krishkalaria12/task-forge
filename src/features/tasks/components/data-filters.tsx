import { ListCheckIcon, UserIcon } from "lucide-react";

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { TaskStatus } from "@/features/tasks/types";
import { useTaskFilters } from "@/features/tasks/hooks/use-task-filters";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectValue,
    SelectTrigger,
} from "@/components/ui/select";
import { DatePicker } from "@/components/date-picker";

interface dataFiltersProps {
    hideProjectFilter?: boolean;
};

export const DataFilters = ({
    hideProjectFilter
}: dataFiltersProps) => {
    const workspaceId = useWorkSpaceId();

    const { data: projects, isLoading: isProjectsLoading } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isMembersLoading } = useGetMembers({ workspaceId });

    const isLoading = isProjectsLoading || isMembersLoading;

    const projectOptions = projects?.documents.map((project) => ({
        value: project.$id,
        label: project.name,
    }));

    const memberOptions = members?.documents.map((project) => ({
        value: project.$id,
        label: project.name,
    }));

    const [{
        assigneeId,
        dueDate,
        projectId,
        status
    }, setFilters] = useTaskFilters();

    const onStatusChange = (value: string) => {
        if (value == "all") {
            setFilters({ status: null });
        } else {
            setFilters({ status: value as TaskStatus });
        }
    }

    const onAssigneeChange = (value: string) => {
        if (value == "all") {
            setFilters({ assigneeId: null });
        } else {
            setFilters({ assigneeId: value as string });
        }
    }

    const onProjectChange = (value: string) => {
        if (value == "all") {
            setFilters({ projectId: null });
        } else {
            setFilters({ projectId: value as string });
        }
    }

    if (isLoading) return null;

    return (
        <div className="flex flex-col lg:flex-row gap-y-2">
            <Select 
                defaultValue={status ?? undefined}
                onValueChange={(value) => onStatusChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <ListCheckIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All statuses" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        All statuses
                    </SelectItem>
                    <SelectSeparator />
                    <SelectItem value={TaskStatus.TODO}>
                        Todo
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                        In Progress
                    </SelectItem>
                    <SelectItem value={TaskStatus.DONE}>
                        Done
                    </SelectItem>
                    <SelectItem value={TaskStatus.BACKLOG}>
                        Backlog
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>
                        In Review
                    </SelectItem>
                </SelectContent>
            </Select>
            <Select 
                defaultValue={assigneeId ?? undefined}
                onValueChange={(value) => onAssigneeChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All assignees" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        All assignees
                    </SelectItem>
                    <SelectSeparator />
                    {memberOptions?.map((member) => (
                        <SelectItem key={member.value} value={member.value}>
                            {member.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select 
                defaultValue={projectId ?? undefined}
                onValueChange={(value) => onProjectChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <UserIcon className="size-4 mr-2" />
                        <SelectValue placeholder="All projects" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        All projects
                    </SelectItem>
                    <SelectSeparator />
                    {projectOptions?.map((project) => (
                        <SelectItem key={project.value} value={project.value}>
                            {project.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <DatePicker 
                placeholder="Due date"
                className="h-8 w-full lg:w-auto"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(date) => {
                    setFilters({ dueDate: date ? date.toISOString() : null })
                }}
            />
        </div>
    )
}