# 完整 CI/CD 流程教學：Express + Docker + Jenkins

本文件旨在提供一個完整、現代化的 CI/CD (持續整合/持續部署) 流程教學。我們將使用一個基於 Express.js (TypeScript) 的專案，並結合 Docker 來實現環境一致性，最終透過 Jenkins 自動化整個測試、建置與部署的流程。

## 核心理念

我們將嚴格區分 **開發環境** 與 **生產環境**：

1.  **開發環境 (Development):**
    *   **目標:** 實現「一鍵啟動」，包含應用程式和資料庫，並提供極致的開發效率。
    *   **工具:** `docker-compose`
    *   **特色:** 支援 **熱加載 (Hot Reloading)**。當您在本地修改程式碼時，服務會自動重啟。

2.  **CI/CD & 生產環境 (Production):**
    *   **目標:** 穩定、高效、可預測的建置與部署。
    *   **工具:** `Dockerfile` (多階段建置) + `Jenkinsfile`
    *   **特色:** 整個流程在乾淨、隔離的 Docker 容器中執行，確保每一次建置的環境都完全一致，最終產出一個輕量、安全的生產級 Docker 映像 (Image)。

---

## 🛠️ Part 1: 環境準備與設定

在開始之前，請確保您的電腦已安裝以下軟體：

*   **Docker Desktop:** 用於在本機執行 Docker 容器。
*   **Git:** 用於版本控制。
*   **程式碼編輯器:** 例如 VS Code。

---

## ⚙️ Part 2: 專案架構與自動化設定

本節將深度解析專案中的核心設定檔案。

### 1. `Dockerfile` (映像建置藍圖)

採用了 **多階段建置 (Multi-stage build)** 的最佳實踐，以區分開發、建置和生產環境，確保最終映像的輕量與安全。

### 2. `docker-compose.yml` (開發環境定義)

此檔案是本地開發的核心，它定義並串連了我們的應用程式服務 (`dev`) 和資料庫服務 (`db`)，實現「一鍵啟動」。

```yaml
# docker-compose.yml
version: '3.8'
services:
  dev:
    build:
      context: .
      target: development
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DB_HOST=db
      # ... 其他環境變數
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=TestDB
      # ... 其他資料庫設定
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d TestDB"]
      # ... 健康檢查設定
volumes:
  postgres_data:
```
*   **`services.dev.depends_on`**: 確保 `db` 服務健康後，`dev` 服務才會啟動。
*   **`services.db.volumes`**: 
    1.  `postgres_data`: 持久化資料庫資料。
    2.  `./docker-entrypoint-initdb.d`: **自動化初始化的關鍵**。PostgreSQL 容器在首次啟動時，會自動執行此目錄下的所有 `.sql` 腳本。

### 3. 資料庫初始化與應用程式設定

*   **`docker-entrypoint-initdb.d/init.sql`**: 在此檔案中定義您的 `CREATE TABLE` 和 `INSERT` 指令。
*   **`src/config/database.ts`**: 修改此檔案，使其從 `process.env` 讀取資料庫連線資訊，以解耦設定。

### 4. `Jenkinsfile` (CI/CD 流水線)

定義了 Jenkins CI/CD 流水線，其核心思想是在 Docker 容器中完成所有測試和建置工作，確保環境一致性。

---

## 🤝 Part 3: 團隊協作與權限管理 (Google Groups 最佳實踐)

當團隊需要共同存取 Google 相關服務 (例如 Google Cloud Platform API、數據分析等) 時，如何管理權限是一個至關重要的問題。

### ❌ 錯誤的做法：共用一個 Google 帳號

最直覺但**最危險**的做法是申請一個共用帳號 (如 `my-team@gmail.com`) 並把密碼分享給所有人。

**為什麼這是絕對錯誤的？**
*   **嚴重安全風險:** 密碼一旦外洩，所有資源都將暴露。啟用兩步驟驗證 (2FA) 會導致單點故障 (只有一個人能收到驗證碼)。
*   **無法追究責任:** 如果有人誤刪了生產環境的資源，您無法從紀錄中得知是**哪一位成員**所為。
*   **管理混亂:** 當有成員離開團隊時，您必須更改密碼並通知所有人，這非常麻煩且容易出錯。

### ✅ 正確的做法：使用 Google Groups 集中管理權限

這是業界的標準做法，安全、高效且易於管理。核心思想是：**每個人都用自己的 Google 帳號登入，權限則由群組統一賦予。**

#### 步驟 1: 建立一個 Google Group

1.  前往 [Google Groups](https://groups.google.com/)。
2.  點擊 **"建立群組"**。
3.  設定群組資訊：
    *   **群組名稱:** 例如 `My Express App Developers`
    *   **群組電子郵件:** 例如 `my-express-app-devs@googlegroups.com` (這個 email 就是您之後用來設定權限的地址)
    *   **權限設定:** 為了安全，建議將「誰可以查看對話」和「誰可以張貼」設定為僅限成員。最重要的是，「誰可以加入群組」應設為「僅限受邀請的使用者」。
4.  點擊 **"建立群組"**。

#### 步驟 2: 將團隊成員加入群組

1.  在您的群組頁面，點擊左側的 **"成員"**。
2.  點擊 **"新增成員"**，並輸入您團隊成員的**個人 Google 帳號**電子郵件。

#### 步驟 3: 在 Google Cloud Platform (GCP) 中賦予群組權限

1.  前往 [Google Cloud Console](https://console.cloud.google.com/) 並選擇您的專案。
2.  在左側導覽選單中，找到 **"IAM 與管理"** > **"IAM"**。
3.  在頁面頂部，點擊 **"授予存取權"**。
4.  在 **"新增主體"** 欄位中，貼上您剛剛建立的 **Google Group 電子郵件地址** (例如 `my-express-app-devs@googlegroups.com`)。
5.  在 **"指派角色"** 中，選擇您想賦予的權限 (例如，**"Editor"** 編輯者角色)。
6.  點擊 **"儲存"**。

#### 好處與總結

現在，所有在該群組中的成員，都自動擁有了對 GCP 專案的權限。管理人員異動只需在 Google Group 中操作，無需在 GCP 中單獨修改，極大地提升了管理效率和安全性。

---

## 🚀 Part 4: 本地開發 "一鍵啟動"

1.  **Clone 專案**並進入目錄。
2.  **準備初始化腳本:** 確保 `docker-entrypoint-initdb.d/init.sql` 檔案中包含了專案所需的正確 SQL 指令。
3.  **啟動完整開發環境:**
    ```bash
    docker-compose up --build
    ```
4.  **開始開發:**
    *   應用程式: `http://localhost:3000`
    *   資料庫 (使用客戶端): `localhost:5433`
    *   修改 `src/` 下的程式碼即可觸發熱加載。
5.  **停止開發環境:** 按下 `Ctrl + C`，可選執行 `docker-compose down` 來移除容器。

---

## 🤖 Part 5: 設定 Jenkins 進行 CI/CD

### 步驟 1: 執行 Jenkins 容器

```bash
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins-server \
  jenkins/jenkins:lts-jdk11
```
*   `-v /var/run/docker.sock:/var/run/docker.sock`: **至關重要**，允許 Jenkins 容器使用主機的 Docker。

### 步驟 2: Jenkins 首次設定

1.  取得管理員密碼: `docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword`
2.  瀏覽 `http://localhost:8080` 並貼上密碼。
3.  選擇 **"Install suggested plugins"** 並建立您的管理員帳號。

### 步驟 3: 安裝 Docker Pipeline 插件

前往 **Manage Jenkins** > **Plugins** > **Available plugins**，搜尋並安裝 `Docker Pipeline`。

### 步驟 4: 建立 Pipeline 專案

1.  **New Item** > 輸入名稱 > 選擇 **Pipeline** > **OK**。
2.  在 **Pipeline** 區塊，將 **Definition** 改為 **"Pipeline script from SCM"**。
3.  **SCM** 選擇 **Git**，並填入您專案的 **Repository URL**。
4.  確認 **Script Path** 是 `Jenkinsfile`。
5.  **Save**。

---

## 🎉 Part 6: 觸發 CI/CD 流程

1.  在您的 Pipeline 專案頁面，點擊左側的 **Build Now**。
2.  在 **Stage View** 中觀察 Checkout, Test, Build 等階段的執行過程。

恭喜！您已成功建立了一個從本地開發、團隊協作到自動化 CI/CD 的完整且專業的流程。