FROM node:18-alpine

WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製應用程式程式碼
COPY . .

# 暴露埠號
EXPOSE 3000

# 啟動命令
CMD ["npm", "run", "dev"]
