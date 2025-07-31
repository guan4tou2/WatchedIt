import Link from "next/link";
import { Eye } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
        <Eye className="w-5 h-5 text-white" />
      </div>
      {showText && (
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          WatchedIt
        </span>
      )}
    </Link>
  );
}
