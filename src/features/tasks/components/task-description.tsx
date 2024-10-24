import { useState } from "react";

import { PencilIcon, XIcon } from "lucide-react";

import { Task } from "@/features/tasks/types";
import { useUpdateTask } from "@/features/tasks/api/use-update-task";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DottedSeperator } from "@/components/dotted-seperator";

interface TaskDescriptionProps {
    task: Task;
};

export const TaskDescription = ({
    task
}: TaskDescriptionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description);
    const { mutate, isPending } = useUpdateTask();

    const handleSave = async () => {
        mutate({
            json: { description: value },
            param: { taskId: task.$id }
        }, {
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    }

    return (
        <div className="p-4 rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                    OverView
                </p>
                <Button
                    variant={"secondary"}
                    size={"sm"}
                    onClick={() => setIsEditing((prev) => !prev)}
                >
                    {
                        isEditing ? (
                            <XIcon className="size-4 mr-2" />
                        ) : (
                            <PencilIcon className="size-4 mr-2" />
                        )
                    }
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>
            <DottedSeperator className="my-4" />
            {isEditing ? (
                <div className="flex flex-col gap-y-4">
                    <Textarea 
                        placeholder="Add a description..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={4}
                        disabled={isPending}
                    />
                    <Button
                        size={"sm"}
                        className="w-fit ml-auto"
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            ) : (
                <div>
                    {task.description || (
                        <span className="text-muted-foreground">
                            No description set
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}