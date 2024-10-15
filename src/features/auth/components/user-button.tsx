"use client"

import { Loader, LogOut } from "lucide-react";

import { 
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DottedSeperator } from "@/components/dotted-seperator";

import { useCurrent } from "@/features/auth/api/useCurrent";
import { useLogout } from "@/features/auth/api/useLogout";

export const UserButton = () => {
    const { data: user, isLoading } = useCurrent();

    const { mutate: logout } = useLogout();

    if(isLoading){
        return (
            <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if(!user){
        return null;
    }

    const { name, email } = user;

    const avatarFallback = name 
        ? name.charAt(0).toUpperCase()
        : name.charAt(0).toUpperCase() ?? "U";

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
                    <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                        {avatarFallback}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
                <div className="flex items-center flex-col justify-center gap-2 px-2.5 py-4">
                    <Avatar className="size-[52px]  border border-neutral-300">
                        <AvatarFallback className="bg-neutral-200 font-xl text-neutral-500 flex items-center justify-center">
                            {avatarFallback}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-xm font-medium text-neutral-900">
                            {name || "User"}
                        </p>
                        <p className="text-xs text-neutral-500">
                            {email}
                        </p>
                    </div>
                    <DottedSeperator className="mb-1" />
                    <DropdownMenuItem className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer"
                    onClick={() => logout()}
                    >
                        <LogOut className="size-4 mr-2" />
                        Log out
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};