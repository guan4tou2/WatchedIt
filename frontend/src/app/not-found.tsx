import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center py-12">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">頁面不存在</h2>
        <p className="text-gray-600 mb-8">
          抱歉，您要找的頁面不存在或已被移除。
        </p>
        <Link href="/">
          <Button>
            <Home className="w-4 h-4 mr-2" />
            返回首頁
          </Button>
        </Link>
      </div>
    </div>
  );
}
