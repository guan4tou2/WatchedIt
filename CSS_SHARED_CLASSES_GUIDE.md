# 共用 CSS 類別使用指南

## 概述
為了避免在每個頁面重複撰寫深色模式的文字顏色，我們在 `globals.css` 中定義了共用的 CSS 類別。這些類別遵循統一的顏色標準，確保整個應用程式在淺色和深色模式下都有一致的視覺效果。

## 文字顏色層次結構

### 1. **主要標題** - 最高對比度
```css
.text-primary-title
```
- 淺色模式: `text-gray-800`
- 深色模式: `dark:text-gray-200`
- 使用場景: 頁面主標題、卡片標題、重要文字

### 2. **次要標題** - 中等對比度
```css
.text-secondary-title
```
- 淺色模式: `text-gray-700`
- 深色模式: `dark:text-gray-300`
- 使用場景: 子標題、表單標籤、次要標題

### 3. **正文文字** - 較低對比度
```css
.text-body
```
- 淺色模式: `text-gray-600`
- 深色模式: `dark:text-gray-400`
- 使用場景: 一般描述文字、狀態文字、統計文字

### 4. **備註文字** - 最低對比度
```css
.text-muted
```
- 淺色模式: `text-gray-500`
- 深色模式: `dark:text-gray-400`
- 使用場景: 備註、次要資訊、空狀態文字

## 表單元素

### 表單標籤
```css
.form-label          /* 一般表單標籤 */
.form-label-secondary /* 次要表單標籤 */
```

### 表單輸入元素
```css
.form-input          /* 輸入框深色模式樣式 */
.form-select         /* 選擇器深色模式樣式 */
```

## 狀態文字

### 一般狀態
```css
.status-text         /* 一般狀態文字 */
.status-text-muted   /* 次要狀態文字 */
```

## 訊息類型

### 錯誤訊息
```css
.error-message
```
- 背景: `dark:bg-red-900/20`
- 邊框: `dark:border-red-800`
- 文字: `dark:text-red-200`

### 成功訊息
```css
.success-message
```
- 背景: `dark:bg-green-900/20`
- 邊框: `dark:border-green-800`
- 文字: `dark:text-green-200`

### 警告訊息
```css
.warning-message
```
- 背景: `dark:bg-yellow-900/20`
- 邊框: `dark:border-yellow-800`
- 文字: `dark:text-yellow-200`

### 資訊訊息
```css
.info-message
```
- 背景: `dark:bg-blue-900/20`
- 邊框: `dark:border-blue-800`
- 文字: `dark:text-blue-200`

## 特殊元素

### 星星圖標
```css
.star-icon           /* 選中的星星 */
.star-icon-unselected /* 未選中的星星 */
```

### 徽章狀態
```css
.badge-unselected    /* 未選中的徽章 */
.selected-bg         /* 選中狀態背景 */
```

### 下拉選單
```css
.dropdown-bg         /* 下拉選單背景 */
.hover-bg           /* 懸停效果 */
```

## 特定用途

### 空狀態
```css
.empty-state         /* 空狀態文字 */
```

### 描述文字
```css
.description-text    /* 描述文字 */
.note-text          /* 備註文字 */
.stats-text         /* 統計文字 */
```

### 標題文字
```css
.title-text         /* 標題文字 */
.subtitle-text      /* 副標題文字 */
```

## 使用範例

### 1. **表單標籤**
```jsx
// 舊寫法
<label className="text-sm font-medium text-gray-600 dark:text-gray-400">
  標題
</label>

// 新寫法
<label className="form-label">
  標題
</label>
```

### 2. **描述文字**
```jsx
// 舊寫法
<p className="text-sm text-gray-600 dark:text-gray-400">
  這是描述文字
</p>

// 新寫法
<p className="text-sm description-text">
  這是描述文字
</p>
```

### 3. **錯誤訊息**
```jsx
// 舊寫法
<div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
  錯誤訊息
</div>

// 新寫法
<div className="bg-red-100 border border-red-400 text-red-700 error-message px-4 py-3 rounded">
  錯誤訊息
</div>
```

### 4. **星星評分**
```jsx
// 舊寫法
<Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mr-1" />

// 新寫法
<Star className="w-4 h-4 star-icon mr-1" />
```

### 5. **空狀態**
```jsx
// 舊寫法
<div className="text-center py-8 text-gray-500 dark:text-gray-400">
  沒有數據
</div>

// 新寫法
<div className="text-center py-8 empty-state">
  沒有數據
</div>
```

## 遷移指南

### 步驟 1: 識別重複的顏色類別
搜尋以下模式：
- `text-gray-600 dark:text-gray-400`
- `text-gray-500 dark:text-gray-400`
- `text-gray-800 dark:text-gray-200`
- `text-gray-700 dark:text-gray-300`

### 步驟 2: 替換為共用類別
根據用途選擇適當的共用類別：
- 表單標籤 → `form-label`
- 描述文字 → `description-text`
- 標題文字 → `title-text`
- 錯誤訊息 → `error-message`

### 步驟 3: 測試效果
- 在淺色模式下檢查可讀性
- 在深色模式下檢查可讀性
- 測試系統主題自動切換

## 優點

### ✅ 一致性
- 所有文字顏色都遵循統一的標準
- 減少視覺不一致的問題
- 確保整個應用程式的視覺統一

### ✅ 維護性
- 集中管理顏色設定
- 修改顏色時只需要更新一個地方
- 減少重複代碼

### ✅ 可讀性
- 經過精心設計的對比度
- 符合 WCAG 可訪問性標準
- 在兩種主題模式下都有良好效果

### ✅ 開發效率
- 減少重複撰寫顏色類別
- 提供語義化的類別名稱
- 加快開發速度

## 注意事項

1. **保持語義化**: 選擇最能表達意圖的類別名稱
2. **避免過度使用**: 只在適當的場景使用共用類別
3. **測試效果**: 每次修改後都要測試兩種主題模式
4. **文檔更新**: 新增共用類別時要更新此文檔

現在您可以在整個應用程式中使用這些共用的 CSS 類別，確保文字顏色的一致性和可維護性！ 