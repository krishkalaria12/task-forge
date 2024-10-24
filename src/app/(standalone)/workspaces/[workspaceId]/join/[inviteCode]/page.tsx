import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries"
import { WorkSpaceIdJoinClient } from "./client";

const WorkSpaceIdJoinPage = async () => {
    const user = await getCurrent();
    if(!user) redirect("/sign-in");

    return <WorkSpaceIdJoinClient />
}

export default WorkSpaceIdJoinPage