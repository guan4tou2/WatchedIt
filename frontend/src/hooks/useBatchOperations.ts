import { useState } from "react";
import { Work, WorkUpdate } from "@/types";

interface UseBatchOperationsProps {
    works: Work[];
    updateWork: (id: string, data: WorkUpdate) => Promise<any>;
    deleteWork: (id: string) => Promise<any>;
    fetchWorks: () => Promise<any>;
    fetchStats: () => Promise<any>;
}

export function useBatchOperations({
    works,
    updateWork,
    deleteWork,
    fetchWorks,
    fetchStats,
}: UseBatchOperationsProps) {
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [selectedWorkIds, setSelectedWorkIds] = useState<Set<string>>(
        new Set()
    );
    const [showBatchEditModal, setShowBatchEditModal] = useState(false);
    const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

    const toggleBatchMode = () => {
        setIsBatchMode(!isBatchMode);
        setSelectedWorkIds(new Set());
    };

    const toggleWorkSelection = (workId: string) => {
        const newSelectedIds = new Set(selectedWorkIds);
        if (newSelectedIds.has(workId)) {
            newSelectedIds.delete(workId);
        } else {
            newSelectedIds.add(workId);
        }
        setSelectedWorkIds(newSelectedIds);
    };

    const selectAllWorks = (filteredWorks: Work[]) => {
        setSelectedWorkIds(new Set(filteredWorks.map((work) => work.id)));
    };

    const clearSelection = () => {
        setSelectedWorkIds(new Set());
    };

    const handleBatchUpdate = async (updates: WorkUpdate) => {
        try {
            const selectedWorks = works.filter((work) =>
                selectedWorkIds.has(work.id)
            );

            for (const work of selectedWorks) {
                await updateWork(work.id, updates);
            }

            // 重新獲取數據
            await fetchWorks();
            await fetchStats();

            // 清除選擇並退出批量模式
            setSelectedWorkIds(new Set());
            setIsBatchMode(false);
            setShowBatchEditModal(false);
        } catch (error) {
            console.error("批量更新失敗:", error);
        }
    };

    const handleBatchDelete = async () => {
        try {
            const selectedWorks = works.filter((work) =>
                selectedWorkIds.has(work.id)
            );

            for (const work of selectedWorks) {
                await deleteWork(work.id);
            }

            // 重新獲取數據
            await fetchWorks();
            await fetchStats();

            // 清除選擇並退出批量模式
            setSelectedWorkIds(new Set());
            setIsBatchMode(false);
            setShowBatchDeleteModal(false);
        } catch (error) {
            console.error("批量刪除失敗:", error);
        }
    };

    const selectedWorks = works.filter((work) => selectedWorkIds.has(work.id));

    return {
        isBatchMode,
        setIsBatchMode,
        selectedWorkIds,
        showBatchEditModal,
        setShowBatchEditModal,
        showBatchDeleteModal,
        setShowBatchDeleteModal,
        toggleBatchMode,
        toggleWorkSelection,
        selectAllWorks,
        clearSelection,
        handleBatchUpdate,
        handleBatchDelete,
        selectedWorks,
    };
}
