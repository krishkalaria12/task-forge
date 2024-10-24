import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation';
import React from 'react'
import { WorkSpaceIdClient } from './client';

const WorkSpaceIdPage = async () => {
    const user = await getCurrent();
    if(!user) redirect("/sign-in");

    return <WorkSpaceIdClient />
}

export default WorkSpaceIdPage