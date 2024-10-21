import Image from "next/image";

import { cn } from "@/lib/utils";

import { 
    Avatar, 
    AvatarFallback 
} from "@/components/ui/avatar";

interface ProjectAvatarProps {
    image?: string;
    name: string;
    className?: string;
    fallbackClassname?: string;
}

export const ProjectAvatar = ({
    image,
    name,
    className,
    fallbackClassname
}: ProjectAvatarProps) => {
    if (image) {
        return (
            <div className={cn(
                "size-5 relative rounded-md overflow-hidden",
                className
            )}>
                <Image src={image} alt={name} className="object-cover" width={40} height={40} />
            </div>
        )
    }

    return (
        <Avatar className={cn(
            "size-5 rounded-md",
            className
        )}>
            <AvatarFallback className={cn(
                "text-white rounded-md bg-blue-600 font-semibold text-sm uppercase",
                fallbackClassname
            )}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    )
}