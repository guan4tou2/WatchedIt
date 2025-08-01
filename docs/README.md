# WatchedIt 文檔

歡迎來到 WatchedIt 專案文檔！這個目錄包含了專案的各種技術文檔和實現說明。

## 📁 目錄結構

### 📖 使用者文檔
- **使用者手冊** (`USER_MANUAL.md`)
  - 完整的使用指南和操作說明
  - 功能介紹和最佳實踐
  - 故障排除和常見問題解答

### 📋 實現文檔 (`implementation/`)
包含各種功能的技術實現細節：

- **AniList 前端實現** (`ANILIST_FRONTEND_IMPLEMENTATION.md`)
  - AniList API 整合
  - 前端搜尋功能實現
  - 資料匯入機制

- **OpenCC 實現** (`OPENCC_IMPLEMENTATION.md`)
  - 簡體轉繁體轉換
  - 包選擇和安裝
  - 運行時修復
  - 類型聲明

- **資料儲存實現**
  - `INDEXEDDB_IMPLEMENTATION.md` - IndexedDB 實現
  - `STORAGE_CONFIRMATION.md` - 儲存確認機制

### 🚀 部署文檔 (`deployment/`)
包含部署相關的指南和配置：

- **快速部署指南** (`QUICK_DEPLOY.md`)
  - 5分鐘快速部署
  - 最簡單的部署方式
  - 適合新手的指南

- **主要部署指南** (`DEPLOYMENT.md`)
  - Vercel 部署（純前端/完整模式）
  - Netlify 部署
  - Docker 部署
  - 環境變數配置
  - 常見問題解決

- **詳細部署指南** (`DEPLOYMENT_GUIDE.md`)
  - 完整的部署流程
  - 最佳實踐和安全指南
  - 監控和維護策略

- **Vercel 相關**
  - `VERCEL_API_FIX.md` - API 修復
  - `VERCEL_GIT_INTEGRATION.md` - Git 整合

- **其他部署**
  - `GITHUB_PAGES_REMOVAL.md` - GitHub Pages 移除

### ✨ 功能文檔 (`features/`)
包含新功能和改進的說明：

- **功能改進** (`FEATURES_IMPROVEMENTS.md`)
  - API URL 動態配置
  - UI 改進和優化
  - 本地設定持久化

- **功能實現**
  - `SETTINGS_HELP_GUIDE_IMPLEMENTATION.md` - 設定幫助指南

## 📖 快速開始

1. 查看 [README.md](../README.md) 了解專案概覽
2. 查看 [使用者手冊](USER_MANUAL.md) 了解如何使用應用
3. 查看 [規格書.md](../規格書.md) 了解功能規格
4. 根據需要查看相應的實現文檔

## 🔧 開發指南

### 前端開發
- 使用 Next.js 13+ App Router
- TypeScript 支援
- Tailwind CSS 樣式
- IndexedDB 本地儲存

### 後端開發
- FastAPI 框架
- SQLite 資料庫
- Docker 容器化

### 部署
- Vercel 前端部署
- Docker Compose 後端部署
- 環境變數配置

## 📝 文檔維護

- 新增功能時請更新相應的文檔
- 重要變更請記錄在實現文檔中
- 部署變更請更新部署文檔

## 🧹 文件整理

### 已完成的整理
- ✅ 合併重複的 OpenCC 文檔
- ✅ 整合部署指南
- ✅ 統一功能改進文檔
- ✅ 移除過時和重複內容

### 整理原則
- 移除重複內容
- 合併相關文檔
- 保持結構清晰
- 確保內容最新

---

如有問題或建議，請參考專案根目錄的 README.md 或開立 Issue。 