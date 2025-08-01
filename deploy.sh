#!/bin/bash

# WatchedIt GitHub Pages 部署腳本

echo "🚀 開始部署 WatchedIt 到 GitHub Pages..."

# 檢查是否在正確的目錄
if [ ! -f "frontend/package.json" ]; then
    echo "❌ 錯誤: 請在專案根目錄執行此腳本"
    exit 1
fi

# 進入前端目錄
cd frontend

# 安裝依賴
echo "📦 安裝依賴..."
npm ci

# 構建應用程序
echo "🔨 構建應用程序..."
npm run build

# 檢查構建是否成功
if [ ! -d "out" ]; then
    echo "❌ 錯誤: 構建失敗，未找到 out 目錄"
    exit 1
fi

# 創建 .nojekyll 文件
echo "📝 創建 .nojekyll 文件..."
touch out/.nojekyll

# 創建 GitHub Actions 工作流程目錄
echo "📝 創建 GitHub Actions 工作流程..."
mkdir -p ../.github/workflows

# 創建部署工作流程
cat > ../.github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
        
    - name: Install dependencies
      working-directory: ./frontend
      run: npm ci
      
    - name: Build application
      working-directory: ./frontend
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend/out
        publish_branch: gh-pages
EOF

echo "✅ 構建完成！"
echo ""
echo "📋 下一步："
echo "1. 推送代碼到 GitHub: git add . && git commit -m 'feat: 修改為靜態導出部署' && git push origin main"
echo "2. 在 GitHub 倉庫設置中啟用 Pages"
echo "3. 選擇 gh-pages 分支作為源"
echo "4. 等待 GitHub Actions 完成部署"
echo ""
echo "🌐 部署完成後，您的應用程序將在以下地址可用："
echo "   https://[您的用戶名].github.io/WatchedIt/" 