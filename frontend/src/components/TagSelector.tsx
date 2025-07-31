"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag } from "@/types";
import { Plus, X } from "lucide-react";

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  disabled?: boolean;
}

export default function TagSelector({
  availableTags,
  selectedTags,
  onTagsChange,
  disabled = false,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);

    if (isSelected) {
      // 移除標籤
      const updatedTags = selectedTags.filter((t) => t.id !== tag.id);
      onTagsChange(updatedTags);
    } else {
      // 添加標籤
      const updatedTags = [...selectedTags, tag];
      onTagsChange(updatedTags);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    const updatedTags = selectedTags.filter((tag) => tag.id !== tagId);
    onTagsChange(updatedTags);
  };

  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.some((selected) => selected.id === tag.id)
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600">標籤</label>

      {/* 已選擇的標籤 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{
                backgroundColor: tag.color + "20",
                color: tag.color,
              }}
              className="flex items-center space-x-1"
            >
              <span>{tag.name}</span>
              {!disabled && (
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* 標籤選擇器 */}
      {!disabled && (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            {selectedTags.length === 0 ? "選擇標籤" : "管理標籤"}
          </Button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              {unselectedTags.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  所有標籤都已選擇
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {unselectedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag)}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center space-x-2"
                    >
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm">{tag.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 點擊外部關閉下拉選單 */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
