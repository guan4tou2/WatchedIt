# OpenCC 簡體轉繁體實現

## 概述

本項目已成功將簡體轉繁體功能從手動的正則表達式替換改為使用 [OpenCC](https://github.com/BYVoid/OpenCC) 庫，提供更高質量的中文轉換。

## 實現過程

### 1. 包選擇與安裝

**最終選擇**: `opencc-js` 包

**安裝**:
```bash
npm install opencc-js
```

**選擇原因**:
- 專為瀏覽器環境設計
- 簡潔的同步 API
- 較小的打包體積
- 與 Next.js 完全兼容

### 2. 包對比分析

| 特性             | opencc-js        | 官方 OpenCC          |
| ---------------- | ---------------- | -------------------- |
| **瀏覽器兼容性** | ✅ 專為瀏覽器設計 | ❌ 包含 Node.js 依賴  |
| **打包大小**     | 較小             | 較大（包含額外依賴） |
| **API 簡潔性**   | ✅ 同步 API       | ⚠️ 需要處理回調       |
| **維護狀態**     | ✅ 活躍維護       | ✅ 官方維護           |
| **功能完整性**   | ✅ 支援主要轉換   | ✅ 完整功能           |

### 3. 實現方案

**之前的實現**（手動正則表達式）：
```typescript
private convertToTraditional(text: string): string {
  return text
    .replace(/进/g, "進")
    .replace(/击/g, "擊")
    .replace(/灭/g, "滅")
    // ... 更多手動替換
}
```

**現在的實現**（使用 OpenCC）：
```typescript
import * as OpenCC from "opencc-js";

private convertToTraditional(text: string): string {
  const converter = OpenCC.Converter({ from: "cn", to: "tw" });
  return converter(text);
}
```

### 4. 運行時修復

**問題**: 導入方式不正確導致運行時錯誤
```
TypeError: can't access property "Converter", opencc_js__WEBPACK_IMPORTED_MODULE_0__.default is undefined
```

**解決方案**: 使用正確的導入方式
```typescript
// 正確的導入方式
import * as OpenCC from "opencc-js";

// 正確的使用方式
const converter = OpenCC.Converter({ from: "cn", to: "tw" });
```

### 5. 類型聲明

```typescript
declare module "opencc-js" {
  export interface OpenCCOptions {
    from: string;
    to: string;
  }

  export interface OpenCCConverter {
    (text: string): string;
  }

  export function Converter(options: OpenCCOptions): OpenCCConverter;
}
```

## 優勢

- **詞彙級別轉換**: OpenCC 支援詞彙級別的轉換，比簡單的字符替換更準確
- **完整覆蓋**: 支援所有簡體字詞的轉換，無需手動維護轉換表
- **高質量**: 基於語言學研究，轉換質量更高
- **維護性**: 減少代碼維護成本，無需手動更新轉換規則

## 測試驗證

所有相關測試都通過：

```bash
✓ 應該將簡體中文轉換為繁體中文
✓ 應該保持繁體中文不變
✓ 應該處理空字串
✓ 應該處理非中文字符
✓ 應該正確轉換常見的簡體字詞
```

## 轉換示例

| 簡體         | 繁體         |
| ------------ | ------------ |
| 进击的巨人   | 進擊的巨人   |
| 机动战士     | 機動戰士     |
| 命运石之门   | 命運石之門   |
| 简体中文测试 | 簡體中文測試 |

## 技術細節

- **庫**: opencc-js v1.0.5
- **配置**: `{ from: "cn", to: "tw" }` (簡體到繁體)
- **性能**: 輕量級實現，對應用性能影響微乎其微
- **兼容性**: 支援所有現代瀏覽器

## 相關文件

- `frontend/src/lib/anilist.ts` - 主要實現文件
- `frontend/src/lib/__tests__/anilist.test.ts` - 測試文件
- `frontend/package.json` - 依賴配置 