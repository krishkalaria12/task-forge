"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal"
import { CreateTaskFormWrapper } from "@/features/tasks/components/create-task-form-wrapper";

const CreateTaskModal = () => {
    const { isOpen, setIsOpen, close } = useCreateProjectModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            <CreateTaskFormWrapper onCancel={close} />
        </ResponsiveModal>
    )
}

export default CreateTaskModal