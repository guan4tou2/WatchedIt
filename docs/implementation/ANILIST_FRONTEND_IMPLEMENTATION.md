# AniList 搜尋功能前端實現

## 概述

AniList 搜尋功能已經正確地在前端實現，直接調用 AniList GraphQL API，無需通過後端代理。

## 實現架構

### 1. 前端直接調用 AniList API

**主要實現文件**: `frontend/src/lib/anilist.ts`

```typescript
class AniListService {
  private graphqlUrl: string = "https://graphql.anilist.co";

  async searchAnime(
    searchTerm: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<AniListMedia[]> {
    const graphqlQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
          media (search: $search, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            // ... 其他欄位
          }
        }
      }
    `;

    const response = await this.query<AniListSearchResponse>(graphqlQuery, {
      search: searchTerm,
      page: page,
      perPage: perPage,
    });

    return response.data.Page.media;
  }
}
```

### 2. 搜尋組件使用前端實現

**組件文件**: `frontend/src/components/AniListSearch.tsx`

```typescript
const searchAnime = useCallback(async (term: string) => {
  if (!term.trim()) {
    setSearchResults([]);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // 直接調用前端 AniList 服務
    const results = await anilistService.searchAnime(term, 1, 10);
    setSearchResults(results);
  } catch (err) {
    // 錯誤處理
  } finally {
    setIsLoading(false);
  }
}, []);
```

## 優勢

### ✅ 前端實現的優點

1. **直接調用**: 無需通過後端代理，減少延遲
2. **即時響應**: 直接從 AniList API 獲取最新數據
3. **減少依賴**: 不依賴後端服務的可用性
4. **簡化架構**: 減少中間層，降低複雜度
5. **更好的錯誤處理**: 可以針對 AniList API 的具體錯誤進行處理

### ✅ 功能特色

- **即時搜尋**: 使用 debounce 優化搜尋體驗
- **繁體中文支援**: 使用 OpenCC 進行簡體轉繁體轉換
- **豐富的動畫資訊**: 包含評分、狀態、格式等詳細資訊
- **智能標題選擇**: 優先顯示繁體中文標題
- **詳細資訊展示**: 支援查看動畫詳細資訊

## 技術實現

### 1. GraphQL 查詢

直接使用 AniList 的 GraphQL API，獲取完整的動畫資訊：

```typescript
const graphqlQuery = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page (page: $page, perPage: $perPage) {
      media (search: $search, type: ANIME) {
        id
        title { romaji english native }
        type format episodes duration
        season seasonYear status
        description coverImage bannerImage
        genres averageScore
        startDate endDate
        synonyms countryOfOrigin
      }
    }
  }
`;
```

### 2. 錯誤處理

針對不同的錯誤情況提供適當的用戶提示：

```typescript
catch (err) {
  const errorMessage = err instanceof Error ? err.message : "搜尋失敗";
  
  if (errorMessage.includes("API 端點未配置") || 
      errorMessage.includes("Failed to fetch")) {
    setError("後端服務不可用。請設定 NEXT_PUBLIC_API_URL 環境變數或部署後端服務。目前僅支援本地儲存模式。");
  } else {
    setError(errorMessage);
  }
}
```

### 3. 數據轉換

使用 OpenCC 進行高質量的簡體轉繁體轉換：

```typescript
private convertToTraditional(text: string): string {
  const converter = OpenCC.Converter({ from: "cn", to: "tw" });
  return converter(text);
}
```

## 與後端 API 的區別

| 特性           | 前端實現       | 後端代理       |
| -------------- | -------------- | -------------- |
| **延遲**       | 低（直接調用） | 高（需要代理） |
| **依賴性**     | 無後端依賴     | 需要後端服務   |
| **維護性**     | 簡單           | 複雜           |
| **錯誤處理**   | 針對性強       | 通用性強       |
| **數據新鮮度** | 即時           | 可能有延遲     |

## 相關文件

- `frontend/src/lib/anilist.ts` - AniList 服務實現
- `frontend/src/components/AniListSearch.tsx` - 搜尋組件
- `frontend/src/lib/__tests__/anilist.test.ts` - 測試文件
- `OPENCC_IMPLEMENTATION.md` - OpenCC 實現說明

## 結論

AniList 搜尋功能已經正確地在前端實現，提供了更好的用戶體驗和更簡潔的架構。這種實現方式符合現代前端應用的最佳實踐，直接與第三方 API 進行交互，無需額外的後端代理層。 