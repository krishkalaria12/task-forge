"use client";
import { useCallback } from "react";

import { Loader, PlusIcon } from "lucide-react"
import { useQueryState } from "nuqs";

import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { DataFilters } from "@/features/tasks/components/data-filters";
import { useTaskFilters } from "@/features/tasks/hooks/use-task-filters";
import { DataTable } from "@/features/tasks/components/data-table";
import { columns } from "@/features/tasks/components/columns";
import { DataKanban } from "@/features/tasks/components/data-kanban";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { TaskStatus } from "@/features/tasks/types";
import { useBulkUpdateTasks } from "@/features/tasks/api/use-bulk-update-task";

import { Button } from "@/components/ui/button"
import { 
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { DottedSeperator } from "@/components/dotted-seperator"

export const TaskViewSwitcher = () => {
    const [{
        assigneeId,
        dueDate,
        projectId,
        status
    }] = useTaskFilters();

    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });

    const { mutate: bulkUpdate } = useBulkUpdateTasks();

    const workspaceId = useWorkSpaceId();

    const { data: tasks, isLoading: isTasksLoading } = useGetTasks({ 
        workspaceId,
        assigneeId,
        dueDate,
        projectId,
        status
    });

    const { open } = useCreateTaskModal();

    const onKanbanChange = useCallback((
        tasks: { 
            $id: string, 
            status: TaskStatus, 
            position: number 
        }[]
    ) => {
        bulkUpdate({
            json: { tasks }
        })
    }, [bulkUpdate]);

    return (
        <Tabs onValueChange={setView} value={view} className="flex-1 w-full border rounded-lg">
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="tabs-switcher">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="table"
                        >
                            Table
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="kanban"
                        >
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="calendar"
                        >
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                    <Button
                        onClick={open}
                        size={"sm"}
                        className="lg:w-auto w-full"
                    >
                        <PlusIcon className="size-4 mr-2" />
                        New
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                    <DataFilters />
                <DottedSeperator className="my-4" />
                {isTasksLoading ? (
                    <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
                        <Loader className="text-muted-foreground size-5 animate-spin" />
                    </div>
                    ) : 
                    <>
                        <TabsContent value="table" className="mt-0">
                            <DataTable 
                                columns={columns}
                                data={tasks?.documents ?? []}
                            />
                        </TabsContent>
                        <TabsContent value="kanban" className="mt-0">
                            <DataKanban onChange={onKanbanChange} data={tasks?.documents ?? []} />
                        </TabsContent>
                        <TabsContent value="calendar" className="mt-0">
                            Calendar
                        </TabsContent>
                    </>
                }
            </div>
        </Tabs>
    )
}