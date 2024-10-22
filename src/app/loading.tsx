"use client";

import { Loader2 } from 'lucide-react'

const LoadingPage = () => {
    return (
        <div className='h-screen flex flex-col items-center justify-center'>
            <Loader2 className='size-6 text-muted-foreground animate-spin' />
        </div>
    )
}

export default LoadingPage