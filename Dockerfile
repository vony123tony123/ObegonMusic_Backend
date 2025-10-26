# --- Stage 1: Development Stage ---
# 這個階段專為開發設計，包含熱重載功能
FROM node:20-slim AS development

# 設定環境變數，確保日誌輸出是即時的
ENV NODE_ENV=development

WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm

# 複製 package.json 和 lock 檔案
COPY package.json pnpm-lock.yaml ./

# 安裝所有依賴，包括 devDependencies
RUN pnpm install

# 複製原始碼 (這一步在 docker-compose 中會被 volume 覆蓋，但保留有助於單獨建置)
COPY . .

# 使用非 root 使用者
USER node

# 使用 nodemon 啟動應用，它會監聽檔案變動並自動重啟
# --exec 'ts-node ...' 告訴 nodemon 如何執行 ts 檔案
# --watch src 監聽 src 目錄下的所有檔案變動
# --ext ts,json 指定監聽的副檔名
# --inspect=0.0.0.0:9229 開啟除錯模式，並允許從外部連接
CMD ["npx", "nodemon", "--watch", "src", "--ext", "ts,json", "--ignore", "src/**/*.test.ts", "--exec", "ts-node ./bin/www.ts"]


# --- Stage 2: Build Stage ---
# 這個階段用於建置生產環境的程式碼
FROM node:20-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# 安裝所有依賴以進行建置
RUN pnpm install

COPY . .

# 編譯 TypeScript
RUN pnpm run build


# --- Stage 3: Production Stage ---
# 最終的生產映像，非常輕量
FROM node:20-slim AS production

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

# 只安裝生產依賴
RUN pnpm install --prod

# 從 builder 階段複製建置好的檔案
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/views ./views
COPY --from=builder /app/storage ./storage

# 開放 Port
EXPOSE 3000

# 使用非 root 使用者
USER node

# 啟動應用的命令
CMD ["node", "dist/bin/www.js"]
