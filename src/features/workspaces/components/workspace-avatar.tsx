import Image from "next/image";

import { cn } from "@/lib/utils";

import { 
    Avatar, 
    AvatarFallback 
} from "@/components/ui/avatar";

interface WorkspaceAvatarProps {
    image?: string;
    name: string;
    className?: string;
}

export const WorkspaceAvatar = ({
    image,
    name,
    className
}: WorkspaceAvatarProps) => {
    if (image) {
        return (
            <div className={cn(
                "size-10 relative rounded-md overflow-hidden",
                className
            )}>
                <Image src={image} alt={name} className="object-cover" width={40} height={40} />
            </div>
        )
    }

    return (
        <Avatar className={cn(
            "size-10 rounded-md",
            className
        )}>
            <AvatarFallback className="text-white rounded-md bg-blue-600 font-semibold text-lg uppercase">
                {name[0]}
            </AvatarFallback>
        </Avatar>
    )
}