"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">頁面不存在</h2>
        <p className="description-text mb-8">
          抱歉，您要找的頁面不存在或已被移除。
        </p>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回上一頁
        </Button>
      </div>
    </div>
  );
}
