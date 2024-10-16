"use client";

import Image from "next/image";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ImageIcon } from "lucide-react";

import { createWorkSpaceSchema } from "@/features/workspaces/schemas";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspace";

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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateWorkspaceFormProps {
    onCancel?: () => void;
};

export const CreateWorkspaceForm = ({ onCancel }: CreateWorkspaceFormProps) => {
    const router = useRouter();
    const { mutate, isPending } = useCreateWorkspace();

    const form = useForm<z.infer<typeof createWorkSpaceSchema>>({
        resolver: zodResolver(createWorkSpaceSchema),
        defaultValues: {
            name: "",
        }
    });

    const onSubmit = async (values: z.infer<typeof createWorkSpaceSchema>) => {
        mutate({ json: values }, {
            onSuccess: ({ data }) => {
                form.reset();
                // onCancel?.();
                router.push(`/workspaces/${data.$id}`);
            }
        });
    };  

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create a new workspace
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
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size={"lg"}
                                disabled={isPending}
                            >
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}