# Vercel Git 整合配置

## 🔗 **整合狀態**

### **✅ 已完成的配置：**

1. **Vercel 帳戶連接**
   - ✅ 已登入 Vercel CLI
   - ✅ 已連接 GitHub 帳戶
   - ✅ 項目已連結到 Vercel

2. **Git 倉庫整合**
   - ✅ 已連接 GitHub 倉庫: `guan4tou2/WatchedIt`
   - ✅ 已設定 Git 遠程倉庫
   - ✅ 已創建 `.vercel` 配置文件

3. **自動部署設定**
   - ✅ 每次 Push 都會觸發部署
   - ✅ Pull Request 會創建預覽部署
   - ✅ 生產環境部署到 `main` 分支

## 📋 **權限配置**

### **GitHub 權限要求：**

根據 [Vercel 文檔](https://vercel.com/docs/git/vercel-for-github)，Vercel 需要以下權限：

#### **Repository Permissions:**
- ✅ **Contents** - 讀取和寫入源代碼
- ✅ **Deployments** - 同步部署狀態
- ✅ **Pull Requests** - 為每個 PR 創建部署
- ✅ **Issues** - 與 Pull Requests 互動
- ✅ **Metadata** - 讀取倉庫基本信息
- ✅ **Web Hooks** - 響應 GitHub 事件
- ✅ **Commit Statuses** - 同步提交狀態

#### **Organization Permissions:**
- ✅ **Members** - 提供更好的團隊體驗

#### **User Permissions:**
- ✅ **Email addresses** - 關聯 GitHub 帳戶郵箱

## 🚀 **自動部署功能**

### **部署觸發條件：**

1. **生產部署**
   - 觸發條件: 推送到 `main` 分支
   - 部署環境: Production
   - URL: https://watchedit-psi.vercel.app

2. **預覽部署**
   - 觸發條件: 創建 Pull Request
   - 部署環境: Preview
   - URL: 自動生成的預覽 URL

3. **分支部署**
   - 觸發條件: 推送到其他分支
   - 部署環境: Preview
   - URL: 自動生成的預覽 URL

## 📊 **部署狀態追蹤**

### **GitHub 整合功能：**

1. **自動部署狀態**
   - ✅ 部署成功/失敗狀態會顯示在 GitHub
   - ✅ 提交狀態會同步到 GitHub
   - ✅ Pull Request 會顯示部署預覽

2. **部署通知**
   - ✅ 部署完成會自動評論到 PR
   - ✅ 部署狀態會顯示在 GitHub UI
   - ✅ 可以靜音部署通知（可選）

3. **部署保護**
   - ✅ 可以設定部署保護規則
   - ✅ 支援密碼保護部署
   - ✅ 支援受信任 IP 限制

## 🔧 **管理命令**

### **查看部署狀態：**
```bash
# 查看所有部署
vercel ls

# 查看特定部署
vercel inspect [deployment-url]

# 查看項目信息
vercel project inspect watchedit
```

### **手動部署：**
```bash
# 部署到生產環境
vercel --prod

# 部署到預覽環境
vercel

# 部署特定分支
vercel --target production
```

### **Git 整合管理：**
```bash
# 檢查 Git 連接狀態
vercel git connect

# 查看項目配置
vercel project ls

# 更新項目設定
vercel project update
```

## 📈 **GitHub Actions 整合**

### **可選的 GitHub Actions 配置：**

如果需要更複雜的 CI/CD 流程，可以使用 GitHub Actions：

```yaml
# .github/workflows/vercel-deploy.yml
name: Vercel Deployment
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🎯 **最佳實踐**

### **1. 分支策略**
- `main` - 生產環境，自動部署
- `develop` - 開發環境，預覽部署
- `feature/*` - 功能分支，預覽部署

### **2. 部署保護**
- 設定部署保護規則
- 使用密碼保護敏感部署
- 配置受信任 IP 限制

### **3. 監控和通知**
- 啟用部署通知
- 設定失敗部署警報
- 監控部署性能

### **4. 環境變數管理**
- 使用 Vercel 環境變數
- 區分開發/生產環境
- 保護敏感信息

## 📞 **故障排除**

### **常見問題：**

1. **權限問題**
   - 確保 GitHub 帳戶有正確權限
   - 檢查倉庫訪問權限
   - 驗證 Vercel 應用權限

2. **部署失敗**
   - 檢查構建日誌
   - 驗證環境變數
   - 確認依賴安裝

3. **Git 整合問題**
   - 重新連接 Git 倉庫
   - 檢查 Webhook 設定
   - 驗證倉庫 URL

### **支援資源：**
- [Vercel 文檔](https://vercel.com/docs/git/vercel-for-github)
- [GitHub 權限說明](https://docs.github.com/en/rest/overview/permissions-required-for-github-apps)
- [Vercel 支援](https://vercel.com/support)

---

**狀態**: ✅ Vercel Git 整合已成功配置並啟用 