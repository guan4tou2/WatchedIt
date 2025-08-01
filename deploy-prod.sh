#!/bin/bash

# WatchedIt 生產環境部署腳本
# 使用方法: ./deploy-prod.sh [環境]

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 環境變數
ENVIRONMENT=${1:-production}
PROJECT_NAME="watchedit"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

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

# 檢查依賴
check_dependencies() {
    log_info "檢查依賴..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安裝"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安裝"
        exit 1
    fi
    
    log_info "依賴檢查完成"
}

# 環境檢查
check_environment() {
    log_info "檢查環境配置..."
    
    if [ ! -f ".env.production" ]; then
        log_warn "未找到 .env.production 文件，將使用默認配置"
        create_env_file
    fi
    
    if [ ! -f "nginx.conf" ]; then
        log_error "未找到 nginx.conf 文件"
        exit 1
    fi
    
    log_info "環境檢查完成"
}

# 創建環境變數文件
create_env_file() {
    log_info "創建環境變數文件..."
    
    cat > .env.production << EOF
# 生產環境配置
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 後端配置
DATABASE_URL=sqlite:///./watchedit.db
SECRET_KEY=$(openssl rand -hex 32)
CORS_ORIGINS=https://your-domain.com

# 數據庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=watchedit
DB_USER=watchedit
DB_PASSWORD=your-password

# Redis 配置
REDIS_URL=redis://localhost:6379

# 日誌配置
LOG_LEVEL=INFO
LOG_FILE=/var/log/watchedit/app.log
EOF
    
    log_warn "請編輯 .env.production 文件以配置您的環境"
}

# 備份數據
backup_data() {
    log_info "備份現有數據..."
    
    if [ -f "watchedit.db" ]; then
        cp watchedit.db "watchedit.db.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "數據庫已備份"
    fi
}

# 構建鏡像
build_images() {
    log_info "構建 Docker 鏡像..."
    
    # 構建前端
    log_info "構建前端鏡像..."
    docker build -t ${PROJECT_NAME}-frontend:${ENVIRONMENT} ./frontend
    
    # 構建後端
    log_info "構建後端鏡像..."
    docker build -t ${PROJECT_NAME}-backend:${ENVIRONMENT} ./backend
    
    log_info "鏡像構建完成"
}

# 停止現有服務
stop_services() {
    log_info "停止現有服務..."
    
    if docker-compose -f ${DOCKER_COMPOSE_FILE} ps | grep -q "Up"; then
        docker-compose -f ${DOCKER_COMPOSE_FILE} down
        log_info "現有服務已停止"
    else
        log_info "沒有運行中的服務"
    fi
}

# 啟動服務
start_services() {
    log_info "啟動生產服務..."
    
    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
    
    log_info "等待服務啟動..."
    sleep 10
    
    # 檢查服務狀態
    if docker-compose -f ${DOCKER_COMPOSE_FILE} ps | grep -q "Up"; then
        log_info "服務啟動成功"
    else
        log_error "服務啟動失敗"
        exit 1
    fi
}

# 健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    # 檢查前端
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "前端服務正常"
    else
        log_error "前端服務異常"
        return 1
    fi
    
    # 檢查後端
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log_info "後端服務正常"
    else
        log_error "後端服務異常"
        return 1
    fi
    
    log_info "健康檢查完成"
}

# 清理舊鏡像
cleanup() {
    log_info "清理舊鏡像..."
    
    # 清理未使用的鏡像
    docker image prune -f
    
    # 清理未使用的容器
    docker container prune -f
    
    log_info "清理完成"
}

# 顯示部署信息
show_deployment_info() {
    log_info "部署完成！"
    echo
    echo "服務信息："
    echo "- 前端: http://localhost:3000"
    echo "- 後端 API: http://localhost:8000"
    echo "- 健康檢查: http://localhost:8000/health"
    echo
    echo "Docker 命令："
    echo "- 查看日誌: docker-compose -f ${DOCKER_COMPOSE_FILE} logs -f"
    echo "- 停止服務: docker-compose -f ${DOCKER_COMPOSE_FILE} down"
    echo "- 重啟服務: docker-compose -f ${DOCKER_COMPOSE_FILE} restart"
    echo
    echo "監控命令："
    echo "- 查看容器: docker-compose -f ${DOCKER_COMPOSE_FILE} ps"
    echo "- 查看資源: docker stats"
    echo "- 查看日誌: docker-compose -f ${DOCKER_COMPOSE_FILE} logs [服務名]"
}

# 主函數
main() {
    log_info "開始 WatchedIt 生產環境部署..."
    log_info "環境: ${ENVIRONMENT}"
    
    check_dependencies
    check_environment
    backup_data
    stop_services
    build_images
    start_services
    health_check
    cleanup
    show_deployment_info
    
    log_info "部署完成！"
}

# 錯誤處理
trap 'log_error "部署失敗，請檢查錯誤信息"; exit 1' ERR

# 執行主函數
main "$@" 