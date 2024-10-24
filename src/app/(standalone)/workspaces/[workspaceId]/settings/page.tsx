import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries"

import { WorkSpaceSettingsClient } from "./client";

const WorkSpaceSettingsPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    return <WorkSpaceSettingsClient />
};

export default WorkSpaceSettingsPage