import { UserButton } from "@/features/auth/components/user-button";
import Image from "next/image";
import Link from "next/link";

interface StandaloneLayoutProps {
    children: React.ReactNode;
}

const StandaloneLayout = ({ children }: StandaloneLayoutProps) => {
    return (
        <main className="bg-neutral-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex justify-between items-center h-[73px]">
                    <Link href={"/"}>
                        <div className="flex items-center space-x-2">
                            <Image src={"/logo.svg"} alt="Logo" width={40} height={40} />
                            <h2 className="text-xl font-bold">Task Forge</h2>
                        </div>
                    </Link>
                    <UserButton />
                </nav>
                <div className="flex flex-col items-center justify-center py-4">
                    {children}
                </div>
            </div>
        </main>
    );
}

export default StandaloneLayout