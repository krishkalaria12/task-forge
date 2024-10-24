import {
    FaCaretDown,
    FaCaretUp
} from "react-icons/fa";

import { cn } from "@/lib/utils";

import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle
} from "@/components/ui/card";

interface AnalyticsCardProps {
    title: string;
    value: number;
    variant: "up" | "down";
    increaseValue: number;
}

export const AnalyticsCard = ({
    increaseValue,
    title,
    value,
    variant
}: AnalyticsCardProps) => {
    const iconColor = variant === "up" ? "text-emerald-500" : "text-red-500";
    const increaseValueColor = variant === "up" ? "text-emerald-500" : "text-red-500";
    const Icon = variant === "up" ? FaCaretUp : FaCaretDown;

    return (
        <Card className="shadow-none border-none w-full">
            <CardHeader>
                <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
                    <span className="text-base truncate">
                        {title}
                    </span>
                </CardDescription>
                <div className="flex items-center gap-x-1">
                    <Icon className={cn(iconColor, "size-4")} />
                    <span className={cn(increaseValueColor, "text-base truncate font-medium")}>
                        {increaseValue}
                    </span>
                </div>
                <CardTitle className="text-3x font-semibold">
                    {value}
                </CardTitle>
            </CardHeader>
        </Card>
    )
}