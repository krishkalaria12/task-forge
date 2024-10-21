"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

import { RiAddCircleFill } from "react-icons/ri"

import { useGetProjects } from "@/features/projects/api/use-get-projects"
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId"
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal"

import { cn } from "@/lib/utils"
import { ProjectAvatar } from "@/features/projects/components/project-avatar"

export const Projects = () => {
    const pathname = usePathname();

    const workspaceId = useWorkSpaceId();
    const { data } = useGetProjects({
        workspaceId
    });
    const { open } = useCreateProjectModal();

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutral-500">Projects</p>
                <RiAddCircleFill onClick={open} className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
            </div>
            {
                data?.documents.map((project) => {
                    const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
                    const isActive = pathname === href;

                    return (
                        <Link href={href} key={project.$id}>
                            <div className={cn(
                                "flex items-center gap-2.5 p-2.5 rounded-md transition hover:opacity-75 cursor-pointer text-neutral-500",
                                isActive && "bg-white text-primary hover:opacity-100 shadow-sm"
                            )}>
                                <ProjectAvatar image={project.imageUrl} name={project.name} />
                                <span className="truncate">{project.name}</span>
                            </div>
                        </Link>
                    )
                })
            }
        </div>
    )
}