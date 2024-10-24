"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, PlusIcon, SettingsIcon } from "lucide-react";

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { Task } from "@/features/tasks/types";
import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Member } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Analytics } from "@/components/analytics";
import { Button } from "@/components/ui/button";
import { DottedSeperator } from "@/components/dotted-seperator";
import { Card, CardContent } from "@/components/ui/card";

export const WorkSpaceIdClient = () => {
    const workspaceId = useWorkSpaceId();

    const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
    const { data: tasks, isLoading: isLoadingTasks} = useGetTasks({ workspaceId });
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    
    const isLoading = isLoadingAnalytics || isLoadingMembers || isLoadingTasks || isLoadingProjects;

    if (isLoading) {
        return <PageLoader />
    }

    if (!analytics || !tasks || !projects || !members) {
        return <PageError message="Failed to load workspace data" />
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <Analytics data={analytics} />
            <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
                <TaskList data={tasks.documents} total={tasks.total} workspaceId={workspaceId} />
                <ProjectList data={projects.documents} total={projects.total} workspaceId={workspaceId} />
                <MemberList data={members.documents} total={projects.total} workspaceId={workspaceId} />
            </div>
        </div>
    )
}

interface TaskListProps {
    data: Task[];
    total: number;
    workspaceId: string;
}

export const TaskList = ({ data, total, workspaceId }: TaskListProps) => {
    const { open: createTask } = useCreateTaskModal();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Tasks ({total})
                    </p>
                    <Button
                        variant={"muted"}
                        size={"icon"}
                        onClick={createTask}
                    >
                        <PlusIcon className="text-neutral-400 size-4" />
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <ul className="flex flex-col gap-y-4">
                    {data.map((task) => (
                        <li key={task.$id}>
                            <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                    <CardContent className="p-4">
                                        <p className="text-lg font-medium truncate">
                                            {task.name}
                                        </p>
                                        <div className="flex items-center gap-x-2">
                                            <p>
                                                {task?.project.name}
                                            </p>
                                            <div className="size-1 rounded-full bg-neutral-300" />
                                            <div className="text-sm text-muted-foreground flex items-center">
                                                <CalendarIcon className="size-3 mr-1" />
                                                <span className="truncate">
                                                    {formatDistanceToNow(new Date(task.dueDate))}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No Task found
                    </li>
                </ul>
                <Button 
                    variant={"muted"}
                    className="mt-4 w-full"
                >
                    <Link href={`/workspaces/${workspaceId}/tasks`}>
                        Show all
                    </Link>
                </Button>
            </div>
        </div>
    )
}

interface ProjectListProps {
    data: Project[];
    total: number;
    workspaceId: string;
}

export const ProjectList = ({ data, total, workspaceId }: ProjectListProps) => {
    const { open: createProject } = useCreateProjectModal();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Projects ({total})
                    </p>
                    <Button
                        variant={"secondary"}
                        size={"icon"}
                        onClick={createProject}
                    >
                        <PlusIcon className="text-neutral-400 size-4" />
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {data.map((project) => (
                        <li key={project.$id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                    <CardContent className="p-4 items-center flex gap-x-2.5">
                                        <ProjectAvatar 
                                            name={project.name}
                                            image={project.imageUrl}
                                            className="size-12"
                                            fallbackClassname="text-lg"
                                        />
                                        <p className="text-lg truncate font-medium">
                                            {project.name}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No Projects found
                    </li>
                </ul>
            </div>
        </div>
    )
}

interface MemberListProps {
    data: Member[];
    total: number;
    workspaceId: string;
}

export const MemberList = ({ data, total, workspaceId }: MemberListProps) => {
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Members ({total})
                    </p>
                    <Button
                        asChild
                        variant={"secondary"}
                        size={"icon"}
                    >
                        <Link href={`/workspaces/${workspaceId}/members`}>
                            <SettingsIcon className="text-neutral-400 size-4" />
                        </Link>
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {data.map((member) => (
                        <li key={member.$id}>
                            <Card className="shadow-none rounded-lg overflow-hidden">
                                <CardContent className="p-3 items-center flex flex-col gap-x-2">
                                        <MemberAvatar 
                                            name={member.name}
                                            className="size-12"
                                        />
                                        <div className="flex flex-col items-center overflow-hidden">    
                                            <p className="text-lg line-clamp-1 font-medium">
                                                {member.name}
                                            </p>
                                            <p className="text-lg line-clamp-1 text-muted-foreground">
                                                {member.email}
                                            </p>
                                        </div>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No Members found
                    </li>
                </ul>
            </div>
        </div>
    )
}