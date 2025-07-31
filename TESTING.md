# 🧪 WatchedIt 測試文檔

## 概述

本文檔描述了 WatchedIt 應用程式的測試策略和執行方法。我們使用 Jest 進行前端測試，pytest 進行後端測試。

## 📁 測試結構

```
WatchedIt/
├── frontend/
│   ├── src/
│   │   ├── __tests__/           # 前端測試文件
│   │   │   ├── localStorage.test.ts
│   │   │   └── anilist.test.ts
│   │   ├── store/__tests__/
│   │   │   └── useWorkStore.test.ts
│   │   └── components/__tests__/
│   │       └── AnimeDetailModal.test.tsx
│   ├── jest.config.js           # Jest 配置
│   ├── jest.setup.js            # Jest 設置
│   └── scripts/test.sh          # 前端測試腳本
├── backend/
│   ├── tests/                   # 後端測試文件
│   │   ├── __init__.py
│   │   ├── conftest.py          # pytest 配置
│   │   ├── test_main.py         # 主應用測試
│   │   ├── test_works.py        # 作品 API 測試
│   │   └── test_tags.py         # 標籤 API 測試
│   ├── pytest.ini              # pytest 配置
│   └── scripts/test.sh          # 後端測試腳本
└── TESTING.md                   # 本文檔
```

## 🚀 快速開始

### 前端測試

```bash
cd frontend
npm install
npm test
```

或使用腳本：

```bash
cd frontend
./scripts/test.sh
```

### 後端測試

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m pytest tests/ -v
```

或使用腳本：

```bash
cd backend
./scripts/test.sh
```

## 📋 測試覆蓋範圍

### 前端測試

#### 1. localStorage 測試 (`localStorage.test.ts`)
- ✅ 作品創建、讀取、更新、刪除
- ✅ 標籤創建、讀取、更新、刪除
- ✅ 統計數據計算
- ✅ 重複檢查邏輯
- ✅ 錯誤處理

#### 2. Zustand Store 測試 (`useWorkStore.test.ts`)
- ✅ Store 初始化
- ✅ 作品 CRUD 操作
- ✅ 標籤 CRUD 操作
- ✅ 重複檢查邏輯
- ✅ 統計數據獲取

#### 3. AniList 服務測試 (`anilist.test.ts`)
- ✅ 動畫搜尋功能
- ✅ 簡體轉繁體中文
- ✅ 標題處理邏輯
- ✅ 數據轉換功能
- ✅ 錯誤處理

#### 4. 組件測試 (`AnimeDetailModal.test.tsx`)
- ✅ 組件渲染
- ✅ 用戶交互
- ✅ 錯誤處理
- ✅ 數據顯示
- ✅ 狀態管理

### 後端測試

#### 1. 主應用測試 (`test_main.py`)
- ✅ API 端點響應
- ✅ 健康檢查
- ✅ CORS 配置

#### 2. 作品 API 測試 (`test_works.py`)
- ✅ CRUD 操作
- ✅ 數據驗證
- ✅ 錯誤處理
- ✅ 統計功能

#### 3. 標籤 API 測試 (`test_tags.py`)
- ✅ CRUD 操作
- ✅ 數據驗證
- ✅ 錯誤處理

## 🛠️ 測試工具

### 前端測試工具

- **Jest**: 主要測試框架
- **@testing-library/react**: React 組件測試
- **@testing-library/user-event**: 用戶交互測試
- **@testing-library/jest-dom**: DOM 斷言擴展

### 後端測試工具

- **pytest**: Python 測試框架
- **pytest-asyncio**: 異步測試支持
- **httpx**: HTTP 客戶端測試
- **SQLAlchemy**: 資料庫測試

## 📊 測試類型

### 1. 單元測試 (Unit Tests)
- 測試單個函數或方法
- 快速執行
- 高覆蓋率
- 獨立執行

### 2. 整合測試 (Integration Tests)
- 測試組件間交互
- 測試 API 端點
- 測試資料庫操作

### 3. 端到端測試 (E2E Tests)
- 測試完整用戶流程
- 測試真實環境
- 測試用戶體驗

## 🎯 測試最佳實踐

### 1. 測試命名
```typescript
// 好的命名
it('應該成功創建新作品', () => {})
it('當作品標題已存在時應該拋出錯誤', () => {})

// 不好的命名
it('test create work', () => {})
it('should work', () => {})
```

### 2. 測試結構
```typescript
describe('功能模組', () => {
  beforeEach(() => {
    // 設置測試環境
  })

  describe('具體功能', () => {
    it('應該在正常情況下工作', () => {
      // 準備
      const input = 'test'
      
      // 執行
      const result = function(input)
      
      // 驗證
      expect(result).toBe('expected')
    })

    it('應該在錯誤情況下處理', () => {
      // 測試錯誤情況
    })
  })
})
```

### 3. Mock 使用
```typescript
// Mock 外部依賴
jest.mock('@/lib/localStorage', () => ({
  workStorage: {
    create: jest.fn(),
    getAll: jest.fn(),
  },
}))

// Mock 函數
const mockCreateWork = jest.fn()
```

### 4. 異步測試
```typescript
it('應該處理異步操作', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})
```

## 🔧 測試配置

### Jest 配置 (frontend/jest.config.js)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

### pytest 配置 (backend/pytest.ini)
```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
asyncio_mode = auto
```

## 📈 測試覆蓋率

### 前端覆蓋率
```bash
npm run test:coverage
```

### 後端覆蓋率
```bash
pip install pytest-cov
python -m pytest tests/ --cov=app --cov-report=html
```

## 🐛 常見問題

### 1. 測試失敗
- 檢查測試環境設置
- 確認依賴已安裝
- 檢查 Mock 配置

### 2. 異步測試問題
- 使用 `async/await`
- 使用 `waitFor`
- 檢查 Promise 處理

### 3. 組件測試問題
- 檢查 React 版本兼容性
- 確認測試環境設置
- 檢查事件處理

## 📝 添加新測試

### 前端測試
1. 在對應目錄創建 `*.test.ts` 或 `*.test.tsx` 文件
2. 導入要測試的模組
3. 編寫測試用例
4. 運行測試

### 後端測試
1. 在 `tests/` 目錄創建 `test_*.py` 文件
2. 導入要測試的模組
3. 編寫測試用例
4. 運行測試

## 🎉 持續整合

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

## 📚 參考資源

- [Jest 官方文檔](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [pytest 官方文檔](https://docs.pytest.org/)
- [FastAPI 測試指南](https://fastapi.tiangolo.com/tutorial/testing/)

---

**注意**: 請確保在修改代碼後運行相關測試，以確保功能正常運作。 