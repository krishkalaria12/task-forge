"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { updateWorkSpaceSchema } from "@/features/workspaces/schemas";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { useDeleteWorkspace } from "@/features/workspaces/api/use-delete-workspace";
import { useResetInviteCode } from "@/features/workspaces/api/use-reset-invite-code";

import { WorkSpace } from "@/features/workspaces/types";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { DottedSeperator } from "@/components/dotted-seperator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import "@uploadthing/react/styles.css";
import { UploadButton } from "@/utils/uploadthing";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";

interface EditWorkspaceFormProps {
    onCancel?: () => void;
    initialValues: WorkSpace;
};

export const EditWorkspaceForm = ({ onCancel, initialValues }: EditWorkspaceFormProps) => {
    const router = useRouter();

    const { mutate, isPending } = useUpdateWorkspace();
    const { mutate: deleteWorkspace, isPending: isDeletePending } = useDeleteWorkspace();
    const { mutate: resetInviteCode, isPending: resettingInviteCode } = useResetInviteCode();

    const { ConfirmationDialog: DeleteDialog, confirm: confirmDelete } = useConfirm(
        "Delete Workspace",
        "This action cannot be undone.",
        "destructive"
    );

    const { ConfirmationDialog: ResetDialog, confirm: confirmResetInviteCode } = useConfirm(
        "Reset Invite Link",
        "This will invalidate the current invite link",
        "destructive"
    );

    const form = useForm<z.infer<typeof updateWorkSpaceSchema>>({
        resolver: zodResolver(updateWorkSpaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        }
    });

    const onSubmit = async (values: z.infer<typeof updateWorkSpaceSchema>) => {
        mutate({ 
            json: values,
            param: { workspaceId: initialValues.$id }
        });
    };

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if(!ok) return;
        
        deleteWorkspace({
            param: { workspaceId: initialValues.$id }
        }, {
            onSuccess: () => {
                window.location.href = "/";
            }
        });
    }

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
        .then(() => toast.success("Invite link copied to clipboard"))
        .catch(() => toast.error("Failed to copy invite link to clipboard"));
    }

    const handleResetInviteCode = async () => {
        const ok = await confirmResetInviteCode();

        if(!ok) return;
        
        resetInviteCode({
            param: { workspaceId: initialValues.$id }
        });
    }

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <ResetDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button
                        onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}
                        variant="secondary"
                        size="sm"
                    >
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeperator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                WorkSpace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter workspace name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2">
                                            <div className="flex items-center gap-x-5">
                                                {
                                                    field.value ? (
                                                        <div className="size-[72px] relative rounded-md overflow-hidden">
                                                            <Image
                                                                src={
                                                                    field.value
                                                                }
                                                                alt="Logo"
                                                                width={72}
                                                                height={72}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Avatar className="size-[72px]">
                                                            <AvatarFallback>
                                                                <ImageIcon className="size-[36px] text-neutral-400" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )
                                                }
                                                <div className="flex flex-col">
                                                    <p className="text-sm">Workspace Icon</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        JPG, PNG, SVG, or JPEG, max 1mb
                                                    </p>
                                                    <UploadButton
                                                        className="mt-2"
                                                        endpoint="imageUploader"
                                                        onClientUploadComplete={(res) => {
                                                            toast.success("Image Uploaded Successfully");
                                                            form.setValue("image", res[0].url);
                                                        }}
                                                        onUploadError={(error: Error) => {
                                                            toast.error(`Failed to upload image!, ${error.message}`);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <DottedSeperator className="py-7" />
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    size={"lg"}
                                    variant={"secondary"}
                                    onClick={onCancel}
                                    disabled={isPending}
                                    className={cn(!onCancel && "invisible")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size={"lg"}
                                    disabled={isPending}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex-col flex">
                        <h3 className="font-bold ">Invite Members</h3>
                        <p className="text-xm text-muted-foreground">
                            Use the invite link to add members to your workspace.
                        </p>
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input 
                                    disabled 
                                    value={fullInviteLink}
                                />
                                <Button
                                    onClick={handleCopyInviteLink}
                                    variant={"secondary"}
                                    className="size-12"
                                >
                                    <CopyIcon className="size-5" />
                                </Button>
                            </div>
                        </div>
                        <DottedSeperator className="py-7" />
                        <Button
                            variant={"destructive"}
                            size={"sm"}
                            className="mt-6 w-fit ml-auto"
                            type="button"
                            onClick={handleResetInviteCode}
                            disabled={isPending || resettingInviteCode}
                        >
                            Reset Invite Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex-col flex">
                        <h3 className="font-bold ">Danger Zone</h3>
                        <p className="text-xm text-muted-foreground">
                            Deleting a workspace is irreversible and will remove all associated data
                        </p>
                        <DottedSeperator className="py-7" />
                        <Button
                            variant={"destructive"}
                            size={"sm"}
                            className="mt-6 w-fit ml-auto"
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending || isDeletePending}
                        >
                            Delete workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}