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

echo "✅ 構建完成！"
echo ""
echo "📋 下一步："
echo "1. 推送代碼到 GitHub: git push origin main"
echo "2. 在 GitHub 倉庫設置中啟用 Pages"
echo "3. 選擇 gh-pages 分支作為源"
echo "4. 等待 GitHub Actions 完成部署"
echo ""
echo "🌐 部署完成後，您的應用程序將在以下地址可用："
echo "   https://[您的用戶名].github.io/WatchedIt/" 