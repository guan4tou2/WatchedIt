import Link from "next/link";
import { Eye } from "lucide-react";
import { usePathname } from "next/navigation";
import { getFullPath } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link
      href={getFullPath("/")}
      className={`flex items-center space-x-2 ${className}`}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
        <Eye className="w-5 h-5 text-primary-foreground" />
      </div>
      {showText && (
        <span className="text-xl font-bold text-foreground">WatchedIt</span>
      )}
    </Link>
  );
}
