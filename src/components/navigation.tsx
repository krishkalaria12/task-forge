"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SettingsIcon, UserIcon } from "lucide-react";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go"

import { useWorkSpaceId } from "@/features/workspaces/hooks/useWorkspaceId";

import { cn } from "@/lib/utils";

const routes = [
    {
        label: "Home",
        href: "",
        icon: GoHome,
        activeIcon: GoHomeFill
    },
    {
        label: "My Tasks",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon
    },
    {
        label: "Members",
        href: "/members",
        icon: UserIcon,
        activeIcon: UserIcon
    },
];

export const Navigation = () => {
    const pathname = usePathname();
    const workspaceId = useWorkSpaceId();

    return (
        <ul className="flex flex-col">
            {routes.map((item) => {
                const fullHref = `/workspaces/${workspaceId}${item.href}`;
                const isActive = pathname === fullHref;
                const Icon = !isActive ? item.icon : item.activeIcon;

                return (
                    <Link key={item.href} href={fullHref}>
                        <div className={cn(
                            "flex rounded-md items-center gap-2.5 p-2.5 font-medium transition hover:text-primary text-neutral-500",
                            isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                        )}>
                            <Icon className="size-5 text-neutral-500" />
                            {item.label}
                        </div>
                    </Link>
                )
            })}
        </ul>
    );
};