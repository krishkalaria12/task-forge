import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AnalyticsCard } from "@/components/analytics-card";
import { DottedSeperator } from "@/components/dotted-seperator";

export const Analytics = ({
    data
}: ProjectAnalyticsResponseType) => {
    if (!data) return null;

    return (
        <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
            <div className="w-full flex flex-row">
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Total tasks"
                        value={data.taskCount}
                        variant={data.taskDifference > 0 ? "up" : "down"}
                        increaseValue={data.taskDifference}
                    />
                </div>
                <DottedSeperator direction="vertical" />
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Assigned Tasks"
                        value={data.assigneedTask}
                        variant={data.assigneedTaskDifference > 0 ? "up" : "down"}
                        increaseValue={data.assigneedTaskDifference}
                    />
                </div>
                <DottedSeperator direction="vertical" />
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Completed Tasks"
                        value={data.completeTask}
                        variant={data.completeTaskDifference > 0 ? "up" : "down"}
                        increaseValue={data.completeTaskDifference}
                    />
                </div>
                <DottedSeperator direction="vertical" />
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Overdue Tasks"
                        value={data.overdueTasks}
                        variant={data.overdueTaskDifference > 0 ? "up" : "down"}
                        increaseValue={data.overdueTaskDifference}
                    />
                </div>
                <DottedSeperator direction="vertical" />
                <div className="flex items-center flex-1">
                    <AnalyticsCard
                        title="Incomplete Tasks"
                        value={data.incompleteTask}
                        variant={data.incompleteTaskDifference > 0 ? "up" : "down"}
                        increaseValue={data.incompleteTaskDifference}
                    />
                </div>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}