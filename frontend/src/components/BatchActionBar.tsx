"use client";

import { Button } from "@/components/ui/button";
import { CheckSquare, Edit3, Square, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface BatchActionBarProps {
  isBatchMode: boolean;
  filteredCount: number;
  selectedCount: number;
  onToggleBatchMode: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchEdit: () => void;
  onBatchDelete: () => void;
}

export default function BatchActionBar({
  isBatchMode,
  filteredCount,
  selectedCount,
  onToggleBatchMode,
  onSelectAll,
  onClearSelection,
  onBatchEdit,
  onBatchDelete,
}: BatchActionBarProps) {
  const actionsT = useTranslations("Home.actions");
  const labelsT = useTranslations("Home.labels");

  if (filteredCount === 0) {
    return null;
  }

  if (!isBatchMode) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleBatchMode}
        className="active:scale-95 transition-transform"
      >
        <Square className="w-4 h-4 mr-1" />
        {actionsT("batchSelect")}
      </Button>
    );
  }

  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-2">
      <Button
        variant="default"
        size="sm"
        onClick={onToggleBatchMode}
        className="active:scale-95 transition-transform"
      >
        <CheckSquare className="w-4 h-4 mr-1" />
        {actionsT("batchMode")}
      </Button>

      <span className="px-2 text-sm text-muted-foreground">
        {labelsT("selectedCount", { count: selectedCount })}
      </span>

      <Button variant="outline" size="sm" onClick={onSelectAll}>
        {actionsT("selectAll")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onClearSelection}
        disabled={!hasSelection}
      >
        {actionsT("clearSelection")}
      </Button>
      <Button size="sm" onClick={onBatchEdit} disabled={!hasSelection}>
        <Edit3 className="w-4 h-4 mr-1" />
        {actionsT("batchEditCount", { count: selectedCount })}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={onBatchDelete}
        disabled={!hasSelection}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        {actionsT("batchDeleteCount", { count: selectedCount })}
      </Button>
    </div>
  );
}
