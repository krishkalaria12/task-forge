"use client"

import { useRouter } from "next/navigation"

import { RiAddCircleFill } from "react-icons/ri"

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar"
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId"
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

export const WorkspaceSwitcher = () => {
    const router = useRouter();
    const workspaceId = useWorkSpaceId();
    const { data: workspaces } = useGetWorkspaces();

    const { open } = useCreateWorkspaceModal();

    const onSelect = (workspaceId: string) => {
        router.push(`/workspaces/${workspaceId}`);
    }

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutral-500">Workspaces</p>
                <RiAddCircleFill onClick={open} className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
            </div>
            <Select onValueChange={onSelect} value={workspaceId}>
                <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
                    <SelectValue placeholder="No Workspace Selected" />
                </SelectTrigger>
                <SelectContent>
                    {
                        workspaces?.documents.map((workspace) => (
                            <SelectItem key={workspace.$id} value={workspace.$id}>
                                <div className="flex justify-start font-medium gap-3 items-center">
                                    <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
                                    <span className="truncate">{workspace.name}</span>
                                </div>
                            </SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>
        </div>
    )
}