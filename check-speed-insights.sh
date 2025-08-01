#!/bin/bash

# WatchedIt Speed Insights 狀態檢查腳本

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 部署 URL
VERCEL_URL="https://watchedit-psi.vercel.app"

# 日誌函數
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# 檢查 Speed Insights 組件
check_speed_insights_component() {
    log_info "檢查 Speed Insights 組件..."
    
    local response=$(curl -s "$VERCEL_URL")
    
    if echo "$response" | grep -q "SpeedInsights"; then
        log_info "✅ Speed Insights 組件已載入"
        return 0
    else
        log_error "❌ Speed Insights 組件未找到"
        return 1
    fi
}

# 檢查 Vercel Analytics
check_vercel_analytics() {
    log_info "檢查 Vercel Analytics..."
    
    local response=$(curl -s "$VERCEL_URL")
    
    if echo "$response" | grep -q "vercel/analytics\|@vercel/analytics"; then
        log_info "✅ Vercel Analytics 已載入"
    else
        log_warn "⚠️  Vercel Analytics 未找到"
    fi
}

# 檢查性能指標
check_performance_metrics() {
    log_info "檢查性能指標..."
    
    local start_time=$(date +%s%N)
    local response=$(curl -s "$VERCEL_URL")
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    log_info "✅ 頁面載入時間: ${duration}ms"
    
    if [ $duration -lt 1000 ]; then
        log_info "✅ 載入速度優秀 (< 1秒)"
    elif [ $duration -lt 3000 ]; then
        log_info "✅ 載入速度良好 (< 3秒)"
    else
        log_warn "⚠️  載入速度較慢 (> 3秒)"
    fi
}

# 檢查安全標頭
check_security_headers() {
    log_info "檢查安全標頭..."
    
    local headers=$(curl -f -s -I "$VERCEL_URL" 2>/dev/null)
    
    if echo "$headers" | grep -q "Strict-Transport-Security"; then
        log_info "✅ HSTS 已啟用"
    else
        log_warn "⚠️  HSTS 未啟用"
    fi
    
    if echo "$headers" | grep -q "X-Frame-Options"; then
        log_info "✅ X-Frame-Options 已設置"
    else
        log_warn "⚠️  X-Frame-Options 未設置"
    fi
    
    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        log_info "✅ X-Content-Type-Options 已設置"
    else
        log_warn "⚠️  X-Content-Type-Options 未設置"
    fi
}

# 檢查 Vercel 部署狀態
check_vercel_deployment() {
    log_info "檢查 Vercel 部署狀態..."
    
    if curl -f -s -I "$VERCEL_URL" > /dev/null 2>&1; then
        log_info "✅ Vercel 部署正常"
    else
        log_error "❌ Vercel 部署異常"
        return 1
    fi
}

# 顯示 Speed Insights 信息
show_speed_insights_info() {
    echo
    log_info "Speed Insights 信息"
    echo "====================="
    echo "部署 URL: $VERCEL_URL"
    echo
    echo "Speed Insights 功能："
    echo "- 自動性能監控"
    echo "- 真實用戶數據收集"
    echo "- 核心 Web 指標追蹤"
    echo "- 地理位置分析"
    echo "- 設備類型分析"
    echo
    echo "查看分析數據："
    echo "1. 登入 Vercel Dashboard"
    echo "2. 選擇 watchedit 項目"
    echo "3. 點擊 'Speed Insights' 標籤"
    echo "4. 查看詳細性能報告"
    echo
    echo "管理命令："
    echo "- 重新部署: cd frontend && vercel --prod"
    echo "- 查看日誌: vercel logs"
    echo "- 檢查狀態: vercel ls"
}

# 主函數
main() {
    log_info "開始 Speed Insights 狀態檢查..."
    echo
    
    # 檢查 Vercel 部署
    check_vercel_deployment
    echo
    
    # 檢查 Speed Insights 組件
    check_speed_insights_component
    echo
    
    # 檢查 Vercel Analytics
    check_vercel_analytics
    echo
    
    # 檢查性能指標
    check_performance_metrics
    echo
    
    # 檢查安全標頭
    check_security_headers
    echo
    
    # 顯示 Speed Insights 信息
    show_speed_insights_info
    
    log_info "Speed Insights 狀態檢查完成！"
    return 0
}

# 執行主函數
main "$@" 