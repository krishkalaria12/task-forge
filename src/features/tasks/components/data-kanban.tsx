import React, { useState, useEffect, useCallback } from "react";

import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult
} from "@hello-pangea/dnd"

import { Task, TaskStatus } from "@/features/tasks/types";
import KanbanColumnHeader from "@/features/tasks/components/kanban-column-header";
import { KanbanCard } from "@/features/tasks/components/kanban-card";

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
];

type TaskState = {
    [key in TaskStatus]: Task[];
}

interface DataKanbanProps {
    data: Task[];
    onChange: (tasks: { $id: string, status: TaskStatus, position: number }[]) => void;
}

export const DataKanban = ({
    data,
    onChange
}: DataKanbanProps) => {
    const [tasks, setTasks] = useState<TaskState>(() => {
        const initialTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach((task) => {
            initialTasks[task.status].push(task);
        });

        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
        });

        return initialTasks;
    });

    useEffect(() => {
        const newTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach((task) => {
            newTasks[task.status].push(task);
        });

        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
        });

        setTasks(newTasks);
    }, [data]);

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        let updatesPayload: { $id: string, status: TaskStatus, position: number }[] = [];

        const { source, destination } = result;
        const sourceStatus = source.droppableId as TaskStatus;
        const destinationStatus = destination.droppableId as TaskStatus;


        setTasks((prevTasks) => {
            const newTasks = {...prevTasks};

            // Safely remove the task from the source column
            const sourceColumn = [...newTasks[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index, 1);

            // if there is no moved task
            if (!movedTask){
                console.error("No task found at the source index");
                return prevTasks;
            }

            // Create a new task object with potentially update status
            const updatedMovedTask = sourceStatus !== destinationStatus ? {...movedTask, status: destinationStatus} : movedTask;

            // update the source column
            newTasks[sourceStatus] = sourceColumn;

            // add the task to destination column
            const destColumn = [...newTasks[destinationStatus]];
            destColumn.splice(destination.index, 0, updatedMovedTask);
            newTasks[destinationStatus] = destColumn;

            updatesPayload = [];

            // always update the moved task
            updatesPayload.push({
                $id: updatedMovedTask.$id,
                status: destinationStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            });

            // update positions for affected task in the destination column
            newTasks[destinationStatus].forEach((task, index) => {
                if (task.$id !== updatedMovedTask.$id) {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                    if (task.position !== newPosition) {
                        updatesPayload.push({
                            $id: task.$id,
                            status: destinationStatus,
                            position: newPosition
                        });
                    }
                }
            });

            // If the task is move between columns, update positions in the source columns
            if (sourceStatus !== destinationStatus) {
                newTasks[sourceStatus].forEach((task, index) => {
                    if (task){
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if (task.position !== newPosition) {
                            updatesPayload.push({
                                $id: task.$id,
                                status: destinationStatus,
                                position: newPosition
                            });
                        }
                    }
                })
            }

            return newTasks;
        });

        onChange(updatesPayload);
    }, [onChange]);
    
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => (
                    <div key={board} className="flex-1 mx-2 bg-muted p-1.5 min-w-[200px] rounded-md">
                        <KanbanColumnHeader 
                            board={board}
                            taskCount={tasks[board].length}
                        />
                        <Droppable droppableId={board}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="min-h-[200px] py-1.5"
                                >
                                    {tasks[board].map((task,index) => (
                                        <Draggable
                                            key={task.$id}
                                            index={index}
                                            draggableId={task.$id}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <KanbanCard 
                                                        task={task}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}