"use client";

import { useWorkStore } from "@/store/useWorkStore";
import TagManager from "@/components/TagManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TagsPage() {
  const router = useRouter();
  const { tags, updateTags } = useWorkStore();

  const handleTagsChange = (newTags: any[]) => {
    updateTags(newTags);
  };

  return (
    <div className="container mx-auto p-6">
      {/* 導航欄 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">標籤管理</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 標籤管理 */}
        <div>
          <TagManager tags={tags} onTagsChange={handleTagsChange} />
        </div>

        {/* 使用說明 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>使用說明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                  新增標籤
                </h4>
                <p>點擊「新增標籤」按鈕，輸入標籤名稱並選擇顏色。</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                  編輯標籤
                </h4>
                <p>點擊標籤旁的編輯圖示，可以修改標籤名稱和顏色。</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                  刪除標籤
                </h4>
                <p>點擊標籤旁的刪除圖示，確認後即可刪除標籤。</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                  標籤使用
                </h4>
                <p>在新增或編輯作品時，可以為作品添加多個標籤。</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>標籤統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>總標籤數:</span>
                <span className="font-medium">{tags.length}</span>
              </div>
              <div className="flex justify-between">
                <span>使用中的標籤:</span>
                <span className="font-medium">
                  {tags.filter((tag) => tag.id > 0).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>注意事項</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <div>• 標籤名稱不能重複</div>
              <div>• 刪除標籤會從所有作品中移除</div>
              <div>• 標籤顏色可以自定義</div>
              <div>• 建議使用有意義的標籤名稱</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
