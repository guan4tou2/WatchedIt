#!/bin/bash

echo "🧪 開始執行測試..."

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo "❌ 錯誤：請在 frontend 目錄中執行此腳本"
    exit 1
fi

# 安裝依賴（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 安裝依賴..."
    npm install
fi

# 運行測試
echo "🔍 執行前端測試..."
npm test

# 檢查測試結果
if [ $? -eq 0 ]; then
    echo "✅ 前端測試通過！"
else
    echo "❌ 前端測試失敗！"
    exit 1
fi

echo "🎉 所有測試完成！" 