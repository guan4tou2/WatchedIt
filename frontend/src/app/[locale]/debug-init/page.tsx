"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkStore } from "@/store/useWorkStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Work, WorkCreate, Tag } from "@/types";
import { ArrowLeft, Save, Star, Plus } from "lucide-react";

export default function DebugInitPage() {
    const {
        works,
        tags,
        stats,
        loading,
        error,
        initialize,
        fetchWorks,
        createWork,
    } = useWorkStore();

    const [createResult, setCreateResult] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [testWork, setTestWork] = useState<WorkCreate>({
        title: "測試作品",
        type: "動畫",
        status: "進行中",
        year: 2024,
        rating: 4,
        review: "測試評論",
        note: "測試備註",
        source: "手動測試",
        tags: [],
        episodes: [],
    });

    useEffect(() => {
        // 初始化
        initialize();
        fetchWorks();
    }, [initialize, fetchWorks]);

    const debugInfo = useMemo(() => {
        return {
            worksCount: works.length,
            works,
            loading,
            error,
            stats,
            tagsCount: tags.length,
            tags,
        };
    }, [works, loading, error, stats, tags]);

    const handleCreateTestWork = async () => {
        setCreateResult(null);
        try {
            const newWork = await createWork(testWork);
            setCreateResult({
                type: "success",
                text: `作品新增成功！ID: ${newWork.id}`,
            });
        } catch (error) {
            console.error("新增作品失敗:", error);
            setCreateResult({
                type: "error",
                text: `新增作品失敗: ${error}`,
            });
        }
    };

    const handleRefresh = async () => {
        await fetchWorks();
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center mb-6">
                <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="mr-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回
                </Button>
                <h1 className="text-2xl font-bold">調試初始化</h1>
            </div>

            {createResult && (
                <div
                    role={createResult.type === "success" ? "status" : "alert"}
                    aria-label="新增測試作品結果"
                    className={`mb-6 rounded border px-4 py-3 text-sm ${
                        createResult.type === "success"
                            ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200"
                            : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
                    }`}
                >
                    {createResult.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 調試資訊 */}
                <Card>
                    <CardHeader>
                        <CardTitle>調試資訊</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p><strong>作品數量:</strong> {debugInfo.worksCount}</p>
                            <p><strong>載入狀態:</strong> {loading ? "載入中" : "已完成"}</p>
                            <p><strong>錯誤:</strong> {error || "無"}</p>
                            <p><strong>標籤數量:</strong> {debugInfo.tagsCount}</p>
                        </div>
                        <Button onClick={handleRefresh} className="mt-4">重新載入</Button>
                    </CardContent>
                </Card>

                {/* 測試新增作品 */}
                <Card>
                    <CardHeader>
                        <CardTitle>測試新增作品</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">標題</label>
                                <Input
                                    value={testWork.title}
                                    onChange={(e) =>
                                        setTestWork({ ...testWork, title: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">類型</label>
                                <select
                                    value={testWork.type}
                                    onChange={(e) =>
                                        setTestWork({
                                            ...testWork,
                                            type: e.target.value as Work["type"],
                                        })
                                    }
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="動畫">動畫</option>
                                    <option value="電影">電影</option>
                                    <option value="電視劇">電視劇</option>
                                    <option value="小說">小說</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">狀態</label>
                                <select
                                    value={testWork.status}
                                    onChange={(e) =>
                                        setTestWork({
                                            ...testWork,
                                            status: e.target.value as Work["status"],
                                        })
                                    }
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="進行中">進行中</option>
                                    <option value="已完結">已完結</option>
                                    <option value="暫停">暫停</option>
                                    <option value="放棄">放棄</option>
                                </select>
                            </div>

                            <Button onClick={handleCreateTestWork} className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                新增測試作品
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 作品列表 */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>作品列表 ({works.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {works.length === 0 ? (
                        <p className="text-gray-500">沒有作品</p>
                    ) : (
                        <div className="space-y-2">
                            {works.map((work) => (
                                <div
                                    key={work.id}
                                    className="p-3 border rounded flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-medium">{work.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {work.type} • {work.status} • {work.year}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Badge variant="outline">{work.type}</Badge>
                                        <Badge variant="outline">{work.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 原始數據 */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>原始數據</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
