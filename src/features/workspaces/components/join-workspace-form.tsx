"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DottedSeperator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

import { useJoinWorkspace } from "@/features/workspaces/api/use-join-workspace";
import { useInviteCode } from "@/features/workspaces/hooks/use-invite-code";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string;
    }
}

export const JoinWorkspaceForm = ({
    initialValues
}: JoinWorkspaceFormProps) => {
    const workspaceId = useWorkSpaceId();
    const inviteCode = useInviteCode();
    const { mutate, isPending } = useJoinWorkspace();

    const router = useRouter();

    const onSubmit = () => {
        mutate({
            param: { workspaceId },
            json: { code: inviteCode }
        }, {
            onSuccess: ({ data }) => {
                router.push(`/workspaces/${data.$id}`);
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-7">
                <CardTitle className="text-xl font-bold">
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join 
                    <strong>
                        {" "}{initialValues.name}{" "}
                    </strong>
                    Workspace
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
                    <Button
                        variant={"secondary"}
                        type="button"
                        asChild
                        size={"lg"}
                        disabled={isPending}
                        className="w-full lg:w-fit"
                    >
                        <Link href={"/"}>
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        size={"lg"}
                        type="button"
                        className="w-full lg:w-fit"
                        onClick={onSubmit}
                        disabled={isPending}
                    >
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}