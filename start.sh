#!/bin/bash

echo "🚀 啟動 WatchedIt 開發環境..."

# 檢查是否在正確的目錄
if [ ! -f "frontend/package.json" ]; then
    echo "❌ 請在專案根目錄執行此腳本"
    exit 1
fi

# 檢查 Node.js 是否安裝
if ! command -v node &> /dev/null; then
    echo "❌ 請先安裝 Node.js"
    exit 1
fi

# 檢查 npm 是否安裝
if ! command -v npm &> /dev/null; then
    echo "❌ 請先安裝 npm"
    exit 1
fi

# 進入前端目錄
cd frontend

# 檢查依賴是否已安裝
if [ ! -d "node_modules" ]; then
    echo "📦 安裝依賴..."
    npm install
fi

# 啟動前端開發伺服器
echo "🎨 啟動前端開發伺服器..."
echo "🌐 訪問地址: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服務"

npm run dev 