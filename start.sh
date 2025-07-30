#!/bin/bash

echo "🚀 啟動 WatchedIt 專案..."

# 檢查是否在正確的目錄
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 請在專案根目錄執行此腳本"
    exit 1
fi

# 啟動後端
echo "📦 啟動後端 API..."
cd backend
uv run --python 3.11 uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 等待後端啟動
sleep 3

# 檢查後端是否正常運行
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 後端 API 已啟動: http://localhost:8000"
    echo "📚 API 文件: http://localhost:8000/docs"
else
    echo "❌ 後端啟動失敗"
    exit 1
fi

# 啟動前端
echo "🎨 啟動前端..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# 等待前端啟動
sleep 5

# 檢查前端是否正常運行
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端已啟動: http://localhost:3000"
else
    echo "❌ 前端啟動失敗"
    exit 1
fi

echo ""
echo "🎉 WatchedIt 專案已成功啟動！"
echo "📱 前端: http://localhost:3000"
echo "🔧 後端 API: http://localhost:8000"
echo "📚 API 文件: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止服務"

# 等待用戶中斷
wait 