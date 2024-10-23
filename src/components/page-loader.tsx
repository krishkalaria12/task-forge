import { Loader } from "lucide-react"

export const PageLoader = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader className="text-muted-foreground size-6 animate-spin" />
        </div>
    )
}