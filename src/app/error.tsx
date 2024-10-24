"use client";

import Link from 'next/link';

import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button';

const ErrorPage = () => {
    return (
        <div className='h-screen flex flex-col items-center justify-center gap-y-2'>
            <AlertTriangle className='size-6 text-muted-foreground' />
            <p className='text-xm text-muted-foreground'>
                Something went Wrong!
            </p>
            <Button
                asChild
                size={"sm"}
                variant={'secondary'}
            >
                <Link
                    href={'/'}
                >
                    Back to home
                </Link>
            </Button>
        </div>
    )
}

export default ErrorPage