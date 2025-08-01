#!/bin/bash

# WatchedIt 部署狀態檢查腳本

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

# 檢查 URL 狀態
check_url() {
    local url=$1
    local name=$2
    
    log_info "檢查 $name..."
    
    if curl -f -s -I "$url" > /dev/null 2>&1; then
        log_info "✅ $name 正常運行"
        return 0
    else
        log_error "❌ $name 無法訪問"
        return 1
    fi
}

# 檢查響應時間
check_response_time() {
    local url=$1
    local name=$2
    
    log_info "檢查 $name 響應時間..."
    
    local start_time=$(date +%s%N)
    if curl -f -s "$url" > /dev/null 2>&1; then
        local end_time=$(date +%s%N)
        local duration=$(( (end_time - start_time) / 1000000 ))
        log_info "✅ $name 響應時間: ${duration}ms"
    else
        log_warn "⚠️  $name 無法訪問"
    fi
}

# 檢查 HTTPS
check_https() {
    local url=$1
    local name=$2
    
    log_info "檢查 $name HTTPS 狀態..."
    
    if curl -f -s -I "$url" | grep -q "HTTP/2\|HTTP/1.1 200"; then
        log_info "✅ $name HTTPS 正常"
    else
        log_warn "⚠️  $name HTTPS 可能有問題"
    fi
}

# 檢查安全標頭
check_security_headers() {
    local url=$1
    local name=$2
    
    log_info "檢查 $name 安全標頭..."
    
    local headers=$(curl -f -s -I "$url" 2>/dev/null)
    
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
    fi
}

# 檢查本地構建
check_local_build() {
    log_info "檢查本地構建..."
    
    cd frontend
    if npm run build > /dev/null 2>&1; then
        log_info "✅ 本地構建成功"
    else
        log_error "❌ 本地構建失敗"
    fi
    cd ..
}

# 檢查依賴
check_dependencies() {
    log_info "檢查依賴..."
    
    # 檢查 Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log_info "✅ Node.js: $node_version"
    else
        log_error "❌ Node.js 未安裝"
    fi
    
    # 檢查 npm
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        log_info "✅ npm: $npm_version"
    else
        log_error "❌ npm 未安裝"
    fi
    
    # 檢查 Vercel CLI
    if command -v vercel &> /dev/null; then
        local vercel_version=$(vercel --version)
        log_info "✅ Vercel CLI: $vercel_version"
    else
        log_warn "⚠️  Vercel CLI 未安裝"
    fi
}

# 顯示部署信息
show_deployment_info() {
    echo
    log_info "部署信息摘要"
    echo "=================="
    echo "Vercel 部署: $VERCEL_URL"
    echo
    echo "快速訪問:"
    echo "- 主頁: $VERCEL_URL"
    echo "- 設置: $VERCEL_URL/settings"
    echo "- 測試: $VERCEL_URL/test"
    echo
    echo "管理命令:"
    echo "- 重新部署: cd frontend && vercel --prod"
    echo "- 查看日誌: vercel logs"
    echo "- 檢查狀態: vercel ls"
}

# 主函數
main() {
    log_info "開始 WatchedIt 部署狀態檢查..."
    echo
    
    # 檢查依賴
    check_dependencies
    echo
    
    # 檢查本地構建
    check_local_build
    echo
    
    # 檢查 Vercel 部署
    check_vercel_deployment
    echo
    
    # 檢查 URL 狀態
    check_url "$VERCEL_URL" "Vercel 部署"
    echo
    
    # 檢查響應時間
    check_response_time "$VERCEL_URL" "Vercel 部署"
    echo
    
    # 檢查 HTTPS
    check_https "$VERCEL_URL" "Vercel 部署"
    echo
    
    # 檢查安全標頭
    check_security_headers "$VERCEL_URL" "Vercel 部署"
    echo
    
    # 顯示部署信息
    show_deployment_info
    
    log_info "部署狀態檢查完成！"
    return 0
}

# 執行主函數
main "$@" 