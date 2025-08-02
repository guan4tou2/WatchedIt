# 集數管理批量功能

## 新增功能

### 1. 批量管理模式
- 新增「批量管理」按鈕，可以進入批量操作模式
- 在批量模式下，每個集數前面會顯示選擇框
- 選中的集數會有藍色邊框和背景高亮

### 2. 批量操作功能
- **全選/取消選擇**: 快速選擇或取消選擇所有集數
- **批量標記已看**: 將選中的集數標記為已看
- **批量標記未看**: 將選中的集數標記為未看
- **批量刪除**: 刪除選中的集數（會顯示確認對話框）

### 3. 手機版優化
- 修復了手機版點擊已看未看按鈕時跳到最頂端的問題
- 通過 `e.preventDefault()` 和 `e.stopPropagation()` 防止事件冒泡
- 改善了手機版的使用體驗

## 使用方法

### 進入批量模式
1. 在集數管理區域點擊「批量管理」按鈕
2. 會顯示批量操作工具欄

### 批量選擇
- 點擊個別集數前的選擇框來選擇/取消選擇
- 使用「全選」按鈕選擇所有集數
- 使用「取消選擇」按鈕清除所有選擇

### 批量操作
- 選擇集數後，可以使用工具欄中的按鈕進行批量操作
- 操作完成後會自動清除選擇狀態

### 退出批量模式
- 點擊「退出批量模式」按鈕
- 或完成批量操作後自動退出

## 技術實現

### 狀態管理
```typescript
const [isBatchMode, setIsBatchMode] = useState(false);
const [selectedEpisodeIds, setSelectedEpisodeIds] = useState<Set<string>>(new Set());
```

### 事件處理優化
```typescript
const handleToggleWatched = (episodeId: string, e?: React.MouseEvent) => {
  // 防止事件冒泡，避免在手機版上跳到頂端
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  // ... 更新邏輯
};
```

### 批量操作函數
- `batchMarkAsWatched()`: 批量標記已看
- `batchMarkAsUnwatched()`: 批量標記未看
- `batchDeleteEpisodes()`: 批量刪除集數

## 測試

可以訪問 `/episode-test` 頁面來測試這些新功能。

## 兼容性

- 支援桌面版和手機版
- 響應式設計，在不同螢幕尺寸下都有良好的使用體驗
- 與現有的集數管理功能完全兼容 