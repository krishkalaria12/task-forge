"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { updateProjectSchema } from "@/features/projects/schemas";
import { useUpdateProject } from "@/features/projects/api/use-update-project";
import { useDeleteProject } from "@/features/projects/api/use-delete-project";

import { Project } from "@/features/projects/types";

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

interface EditProjectFormProps {
    onCancel?: () => void;
    initialValues: Project;
};

export const EditProjectForm = ({ onCancel, initialValues }: EditProjectFormProps) => {
    const router = useRouter();

    const { mutate, isPending } = useUpdateProject();
    const { mutate: deleteWorkspace, isPending: isDeletePending } = useDeleteProject();

    const { ConfirmationDialog: DeleteDialog, confirm: confirmDelete } = useConfirm(
        "Delete Workspace",
        "This action cannot be undone.",
        "destructive"
    );

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? ""
        }
    });

    const onSubmit = async (values: z.infer<typeof updateProjectSchema>) => {
        mutate({ 
            json: values,
            param: { projectId: initialValues.$id }
        }, {
            onSuccess: () => {
                form.reset();
            }
        });
    };

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if(!ok) return;
        
        deleteWorkspace({
            param: { projectId: initialValues.$id }
        }, {
            onSuccess: () => {
                window.location.href = `/workspaces/${initialValues.workspaceId}`;
            }
        });
    }

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button
                        onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}`)}
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
                                                Project Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter project name"
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
                                                    <p className="text-sm">Project Icon</p>
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
                            Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}