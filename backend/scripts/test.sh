#!/bin/bash

echo "🧪 開始執行後端測試..."

# 檢查是否在正確的目錄
if [ ! -f "requirements.txt" ]; then
    echo "❌ 錯誤：請在 backend 目錄中執行此腳本"
    exit 1
fi

# 檢查虛擬環境
if [ ! -d ".venv" ]; then
    echo "📦 創建虛擬環境..."
    python -m venv .venv
fi

# 激活虛擬環境
echo "🔧 激活虛擬環境..."
source .venv/bin/activate

# 安裝依賴
echo "📦 安裝依賴..."
pip install -r requirements.txt

# 運行測試
echo "🔍 執行後端測試..."
python -m pytest tests/ -v

# 檢查測試結果
if [ $? -eq 0 ]; then
    echo "✅ 後端測試通過！"
else
    echo "❌ 後端測試失敗！"
    exit 1
fi

echo "🎉 後端測試完成！" 