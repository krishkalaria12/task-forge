"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";

import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { MemberRole } from "@/features/members/types";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DottedSeperator } from "@/components/dotted-seperator";
import { useConfirm } from "@/hooks/use-confirm";

const MembersList = () => {
    const workspaceId = useWorkSpaceId();
    const { data } = useGetMembers({ workspaceId });

    const { ConfirmationDialog: DeleteDialog, confirm: confirmDelete } = useConfirm(
        "Remove member",
        "This member will be removed from the workspace",
        "destructive"
    );

    const {
        mutate: deleteMember,
        isPending: isDeletingMember
    } = useDeleteMember();

    const {
        mutate: updateMember,
        isPending: isUpdatingMember
    } = useUpdateMember();

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        updateMember({
            json: { role },
            param: { memberId }
        });
    }

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirmDelete();

        if(!ok) return;

        deleteMember({
            param: { memberId }
        }, {
            onSuccess: () => {
                window.location.reload();
            }
        });
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <DeleteDialog />
            <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                <Button
                    variant={"secondary"}
                    asChild
                    size={"sm"}
                >
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <CardTitle className="text-xl font-bold">
                    Members List
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                {
                    data?.documents.map((member, index) => (
                        <Fragment key={member.$id}>
                            <div className="flex items-center gap-2">
                                <MemberAvatar 
                                    className="size-10"
                                    fallbackClassname="text-lg"
                                    name={member.name}
                                />
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium">
                                        {member.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {member.name}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button
                                        className="ml-auto"
                                        variant={"secondary"}
                                        size={"icon"}
                                    >
                                        <MoreVerticalIcon className="text-muted-foreground size-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="bottom" align="end">
                                        <DropdownMenuItem 
                                        className="font-medium"
                                        onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
                                        disabled={isUpdatingMember}
                                        >
                                            Set as Administrator
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                        className="font-medium"
                                        onClick={() => handleUpdateMember(member.$id,MemberRole.MEMBER)}
                                        disabled={isUpdatingMember}
                                        >
                                            Set as Member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                        className="font-medium text-amber-700"
                                        onClick={() => handleDeleteMember(member.$id)}
                                        disabled={isDeletingMember}
                                        >
                                            Remove Member
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {index < data.documents.length - 1 && (
                                <Separator className="my-2.5" />
                            )}
                        </Fragment>
                    ))
                }
            </CardContent>
        </Card>
    )
}

export default MembersList