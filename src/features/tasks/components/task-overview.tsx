import { PencilIcon } from "lucide-react";

import { Task } from "@/features/tasks/types";
import { OverviewProperty } from "@/features/tasks/components/overview-property";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "@/features/tasks/components/task-date";

import { DottedSeperator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { snakeCaseToTitleCase } from "@/utils/caseChange";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";

interface TaskOverViewProps {
    task: Task;
}

export const TaskOverView = ({
    task
}: TaskOverViewProps) => {
    const { open } = useEditTaskModal();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <p className="text-lg font-semibold">
                    Overview
                </p>
                <Button
                    size={"sm"}
                    variant={"secondary"}
                    onClick={() => open(task.$id)}
                >
                    <PencilIcon className="size-4 mr-2" />
                    Edit
                </Button>
            </div>
            <DottedSeperator className="my-4" />
            <div className="flex flex-col gap-y-4">
                <OverviewProperty label="Assignee">
                    <MemberAvatar 
                        name={task?.assignee?.name}
                        className="size-6"
                    />
                    <p className="text-sm font-medium">
                        {task?.assignee?.name}
                    </p>
                </OverviewProperty>
                <OverviewProperty label="Due Date">
                    <TaskDate classname="text-sm font-medium" value={task?.dueDate} />
                </OverviewProperty>
                <OverviewProperty label="Status">
                    <Badge variant={task?.status}>
                        {snakeCaseToTitleCase(task?.status)}
                    </Badge>
                </OverviewProperty>
            </div>
        </div>
    )
}