# myExpressApp

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

> 這是一個使用 TypeScript 建構的 Express.js 應用程式，同時支援 REST 和 GraphQL API。專案已使用 Docker 進行容器化，以簡化開發環境的設定。

## 📋 目錄

- [✨ 功能特色](#-功能特色)
- [🛠️ 技術棧](#️-技術棧)
- [📂 專案架構](#-專案架構)
- [🚀 開始使用](#-開始使用)
- [🔧 可用腳本](#-可用腳本)

## ✨ 功能特色

- **後端框架**: Express.js
- **開發語言**: TypeScript
- **API**: 同時支援 RESTful API 和 GraphQL
- **資料庫**: PostgreSQL (透過 Docker 管理)
- **樣板引擎**: Pug
- **容器化**: 透過 Docker 和 Docker Compose 提供一致且便利的開發環境
- **測試**: 使用 Jest 進行單元測試

## 🛠️ 技術棧

- **後端**: [Express.js](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **資料庫**: [PostgreSQL](https://www.postgresql.org/)
- **API 層**: [GraphQL](https://graphql.org/), REST
- **測試**: [Jest](https://jestjs.io/)
- **容器化**: [Docker](https://www.docker.com/)

## 📂 專案架構

<details>
<summary>點擊展開查看專案結構</summary>

```
myExpressApp/
├── src/                # 主要的應用程式原始碼
│   ├── controllers/    # REST API 的請求處理器
│   ├── graphql/        # GraphQL 的 Schema 和 Resolver
│   ├── models/         # 資料庫模型與相關邏輯
│   ├── config/         # 設定檔 (例如資料庫連線)
│   └── db.ts           # 資料庫連線設定
├── routes/             # Express 的路由定義
├── public/             # 靜態資源 (CSS, 圖片等)
├── views/              # Pug 樣板檔案
├── bin/                # 可執行的腳本 (例如啟動伺服器)
├── docker-compose.yml  # 定義 Docker 服務 (應用程式、資料庫)
├── Dockerfile          # 用於建構應用程式 Docker 映像檔的指令
└── package.json        # 專案依賴與可執行的腳本
```

</details>

## 🚀 開始使用

### 環境需求

- [Node.js](https://nodejs.org/) (建議使用 v18.x 或更新版本)
- [pnpm](https://pnpm.io/) (或 npm, yarn 等其他套件管理器)
- [Docker](https://www.docker.com/products/docker-desktop/)

### 方法一：使用 Docker (建議)

這是啟動應用程式和資料庫最簡單的方式。

1.  **建構並啟動容器:**
    在專案根目錄下，執行以下指令：
    ```bash
    docker-compose up --build
    ```
    這個指令會建構應用程式的映像檔，啟動應用程式和資料庫容器，並執行資料庫的初始化腳本。

2.  **存取應用程式:**
    - 應用程式將在 `http://localhost:<APP_PORT>` 上提供服務。
    - GraphQL Playground 可在 `http://localhost:<APP_PORT>/graphql` 存取。
    - PostgreSQL 資料庫將會對應到你本地機器的 `<DB_PORT>` 連接埠。

    > **Note:** 端口號 (`<APP_PORT>` 和 `<DB_PORT>`) 的對應關係定義在 `docker-compose.yml` 檔案的 `ports` 區塊中。

### 方法二：本地開發 (不使用 Docker)

1.  **安裝依賴:**
    ```bash
    pnpm install
    ```

2.  **設定資料庫:**
    你需要一個正在運行的 PostgreSQL 實例。請在你的 PostgreSQL 中手動建立一個資料庫，並將其連線資訊用於下一步。

3.  **設定環境變數:**
    將 `.env.example` 複製為一個新的 `.env` 檔案：
    ```bash
    cp .env.example .env
    ```
    接著，編輯 `.env` 檔案並填入你本地資料庫的連線資訊 (包含你在上一步建立的資料庫名稱和應用程式端口 `<APP_PORT>`)。

4.  **啟動開發伺服器:**
    此指令會使用 `nodemon` 啟動伺服器，它會自動監聽檔案變更並重啟應用程式。
    ```bash
    pnpm run dev
    ```
5.  應用程式將在你於 `.env` 中指定的 `http://localhost:<APP_PORT>` 上提供服務。

## 🔧 可用腳本

以下是 `package.json` 中定義的主要腳本及其功能：

- `pnpm run dev`: 在開發模式下啟動應用程式，並啟用熱重載 (Hot-Reloading)。
- `pnpm start`: 執行應用程式的生產版本 (需要先執行 `pnpm run build`)。
- `pnpm build`: 將 TypeScript 程式碼編譯為 JavaScript，並輸出到 `dist/` 目錄。
- `pnpm test`: 使用 Jest 執行所有單元測試。
- `pnpm run seed`: 執行資料庫初始化腳本，填充種子資料。
- `pnpm run backup`: 執行資料庫備份腳本。