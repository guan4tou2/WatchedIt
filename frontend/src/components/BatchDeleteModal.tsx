"use client";

import { useState } from "react";
import { Work } from "@/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface BatchDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorks: Work[];
  onBatchDelete: () => Promise<void>;
}

export default function BatchDeleteModal({
  isOpen,
  onClose,
  selectedWorks,
  onBatchDelete,
}: BatchDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onBatchDelete();
      onClose();
    } catch (error) {
      console.error("批量刪除失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <span>確認批量刪除</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-3">
              <p>
                您確定要刪除以下 {selectedWorks.length}{" "}
                個作品嗎？此操作無法撤銷。
              </p>

              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedWorks.map((work) => (
                  <div
                    key={work.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                  >
                    <span className="truncate">{work.title}</span>
                    <span className="text-gray-500 text-xs">{work.type}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">刪除後將無法恢復</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600"
          >
            {isLoading ? "刪除中..." : `確認刪除 (${selectedWorks.length})`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
