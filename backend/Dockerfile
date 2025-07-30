FROM python:3.11-slim

WORKDIR /app

# 安裝 uv
RUN pip install uv

# 複製依賴檔案
COPY requirements.txt .

# 使用 uv 安裝依賴
RUN uv pip install -r requirements.txt

# 複製應用程式程式碼
COPY app/ ./app/

# 暴露埠號
EXPOSE 8000

# 啟動命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
