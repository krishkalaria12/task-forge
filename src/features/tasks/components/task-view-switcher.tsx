"use client";

import { PlusIcon } from "lucide-react"

import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal"

import { Button } from "@/components/ui/button"
import { 
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { DottedSeperator } from "@/components/dotted-seperator"

const TaskViewSwitcher = () => {
    const { open } = useCreateProjectModal();

    return (
        <Tabs className="flex-1 w-full border rounded-lg">
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
                    Data Filters
                <DottedSeperator className="my-4" />
                <>
                    <TabsContent value="table" className="mt-0">
                        Data Table
                    </TabsContent>
                    <TabsContent value="kanban" className="mt-0">
                        Kanban
                    </TabsContent>
                    <TabsContent value="calendar" className="mt-0">
                        Calendar
                    </TabsContent>
                </>
            </div>
        </Tabs>
    )
}

export default TaskViewSwitcher