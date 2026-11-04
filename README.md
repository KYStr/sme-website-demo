# 精睿精密工業 FineForm

虛構的台中精密加工廠示範網站。首頁用捲動把鏡頭帶進廠房：鐵捲門、CNC 加工區、成品架、量測室，最後停在出貨區。詢價表單在 API 活著時會真的入庫並給編號；API 不在時，同一份建置會改走誠實的郵件備案，不假裝送出。

**示意資料、非真實客戶。** 公司、產品、設備型號、客戶與聯絡資訊都是為作品集編的。電話 `04-2000-0000（示意）`，地址「台中市示範區虛構路 1 號（示意）」，Email `contact@fineform.example`。

## English summary

A portfolio demo for a fictional Taichung CNC job shop, FineForm Precision. Four public pages, Traditional Chinese copy, and a scroll-driven low-poly factory on the home page. The inquiry form posts to a small Node API in this repo when that API answers a health check; otherwise the same build says the message was not sent and offers a mailto fallback. Nothing here is a real company, client, or machine brand.

## 功能

- 四個公開頁面：首頁、產品與服務、關於我們、聯絡詢價。`/admin` 不在導覽裡
- 首頁六站捲動旅程：廠外、進廠、加工區、成品架、量測室、出貨區
- 主走道旁有 CNC 防護屏、工具櫃與棒材架；成品暫存、量測室與出貨區以地面標線和滑門分區
- 鏡頭沿 CatmullRom 曲線前進；滾輪每次定位一站，文字只顯示當前站，拖動與觸控捲動會自動靠站
- 不支援 WebGL，或系統開啟「減少動態效果」時，改為靜態廠房立面與直排內容
- 產品頁 8 個示意品項、程式繪製的藍圖線稿、分類篩選
- 關於頁沿革、通用型號設備表、品質流程
- 聯絡表單：API 在線時送出並顯示 `FF-YYYY-NNNN`；不在線、或健康檢查回的不是 JSON，就顯示沒有送出，並給 mailto
- 管理列表要 `ADMIN_KEY`。列表遮罩 Email 與電話，單筆才看全文。沒有設定金鑰時列表關閉

規格與錯誤碼見 [`docs/api.md`](docs/api.md)。前後端共用的欄位規則見 [`docs/validation-rules.md`](docs/validation-rules.md)。

## 怎麼跑

需要 Node.js `>=24.14`。這個版本能直接跑 TypeScript，也帶 `node:sqlite`。

```bash
npm install
copy .env.example .env
npm run dev:all
```

`copy` 是 Windows。macOS 與 Linux 用 `cp .env.example .env`。`.env` 不會進 git。範例金鑰是公開假值，拿來示範可以，不要把它當成正式密碼。

`npm run dev:all` 同時起兩件事：

| 程序 | 位址 | 做什麼 |
| --- | --- | --- |
| Vite | `http://127.0.0.1:5173` | 前台。`/api` 由 Vite 轉到 API |
| API | `http://127.0.0.1:3001` | `server/index.ts`，只聽本機 |

瀏覽器開 Vite 那個網址。單獨開前台是 `npm run dev`，單獨開 API 是 `npm run dev:server`。

```bash
npm test
npm run check
npx playwright test
```

`npm test` 用 Node 內建的 `node:test`，不開瀏覽器。`npm run check` 是 lint、型別、再加上這個測試。Playwright 會自己建置、重設 `data/e2e.sqlite`、起動 API 與 preview。端對端測試留在本機跑：它要下載瀏覽器，首頁的 WebGL 測試也比較重，而且對機器負載敏感。GitHub Actions 只跑 `npm run check`，見 [`.github/workflows/ci.yml`](.github/workflows/ci.yml)。

```bash
npm run seed
npm run db:reset
```

`seed` 寫入 12 筆示意詢問。資料庫裡已經有資料時會拒絕，避免編號被接在半空的檔案後面。`db:reset` 刪掉資料庫檔再重寫。

`npm run build` 的 base 是 `/`，給網域根目錄用。`npm run build:gh` 用 `/sme-website-demo/`，並把 `dist/index.html` 複製成 `dist/404.html`，給 GitHub Pages 的子路徑用。靜態部署沒有 API 時，表單會走離線備案。

## 環境變數

`.env.example` 只有名字和假值。API 用 `--env-file-if-exists=.env` 讀取；已經存在的環境變數不會被蓋掉。

| 變數 | 預設 | 作用 |
| --- | --- | --- |
| `PORT` | `3001` | API port，1–65535 |
| `HOST` | `127.0.0.1` | API 綁定位址。預設只聽本機 |
| `ADMIN_KEY` | 無 | 管理 API 的金鑰。未設定或少於 16 字元時，列表 API 回 503，不開放 |
| `DB_PATH` | `data/inquiries.db` | SQLite 檔。`:memory:` 只給測試 |
| `ALLOWED_ORIGINS` | 空 | 逗號分隔的額外 CORS origin。非 production 會再加上 Vite 與 preview 的本機 origin |
| `FORM_SECRET` | 每次啟動現做 | 簽表單令牌。未設定時重啟會讓舊令牌失效；有設則至少 16 字元 |
| `TRUST_PROXY` | 關 | 只有恰好是 `1` 才讀 `X-Forwarded-For` 的第一段 |
| `NODE_ENV` | `development` | `production` 時不再自動加入開發用 origin |
| `VITE_API_BASE` | 空 | 前台 API 前綴。空字串表示同源的 `/api` |

## 管理列表不是登入系統

`/admin` 用 `Authorization: Bearer <ADMIN_KEY>`。金鑰放在這個分頁的 `sessionStorage`，關掉分頁就沒了。比對前兩邊都先做 SHA-256，再用固定時間比較。沒帶、或帶錯，是 401。同一個 IP 十分鐘內錯到第 10 次回 429，並寫明多久可以再試。鎖住期間，正確金鑰也要等窗口過去。

這是示範用的一道門，用來避免列表裸奔。它不是帳號、不是工作階段、也不能抵擋拿到金鑰的人。正式環境要換成真正的登入、權限與稽核。

列表上的 Email 是 `a***@example.com` 這種形狀，電話只留後四碼。完整聯絡方式只在單筆頁。遮罩是伺服器做的，列表的 JSON 裡沒有原文。

## 取捨紀錄

每一條都是兩邊都做了，或是明確選了邊。沒有默默拿掉。

**成功回應與離線。** 兩邊都做。掛載時打 `GET /api/health`，三秒逾時。只有 HTTP 200、本文是 JSON、而且 `status` 是 `ok`，才當成 API 在線。靜態站把 `/api/health` 回成 200 HTML 時，會被判成離線。離線時不清空表單，顯示沒有送出，並給一封預填、長度壓在 1800 字以內的 mailto。送出若遇到斷線、5xx 或非 JSON，同樣改走這條，不顯示編號。

**機器人回應用 201，不用規格裡的 200。** 蜜罐或未滿兩秒的送出，回 201 和一組看起來真的編號，但不入庫。200 會讓機器人用狀態碼分辨自己被擋。代價是假編號會預看下一號而不佔號，稍後的真實詢問可能用到同一個號碼；那組假編號在列表裡查不到。

**`node:sqlite` 仍是 experimental。** 選它是為了執行期零依賴，HTTP、CORS、body 上限都自己寫，規則與測試不必再裝一個框架。代價是要鎖 Node `>=24.14`，啟動時關掉那個 experimental 警告，而且介面以後仍可能變。正式產品我會改用已穩定的驅動。

**速率限制放在記憶體。** 同一個 IP 十分鐘五次，第六次回 429，`Retry-After` 與中文訊息都寫還要多久。重送同一個 submission id 不算一次。驗證失敗與蜜罐算。重啟會歸零，多個行程不共享，同一台 NAT 後面的人共用額度。這個示範只有一個行程，所以夠用。

**只有 `TRUST_PROXY=1` 才相信 `X-Forwarded-For`。** 否則任何人都能換 IP。本機開發不開。

**時間陷阱用伺服器簽的令牌，不用瀏覽器自己報的時間。** `/api/health` 簽進發出時刻。未滿兩秒當成機器人；簽章錯、或超過 24 小時，回 422 `form_expired`，不當成機器人吞掉。前台若還沒滿兩秒會自己等到滿，所以正常人不會踩到。伺服器重啟且沒有固定 `FORM_SECRET` 時，舊令牌失效，客人再送一次即可。

**蜜罐可能誤傷會自動填表的瀏覽器。** 欄位放到畫面外、`aria-hidden`、`tabindex="-1"`。有值就假裝成功、不入庫。自動填表若填了 `website`，那一次詢問會不見。這是用誤傷換「機器人不知道被擋」；正式環境要加上客人找得到的備援。

**管理金鑰放 `sessionStorage`。** 不進 localStorage，也不進網址。開發工具還是看得到。上面已經寫了這不是登入系統。

**列表用 offset 分頁，每頁 10 筆。** 實作直，資料量是示範規模。有人在翻頁時新增資料，頁面可能重覆或漏一筆。正式列表再改 cursor。

**字數用 UTF-16 的 `.length`。** 與瀏覽器 `maxLength` 同一把尺。一個 emoji 可能算兩個字。

**冪等。** 打開表單時產生 submission id。內容沒改就沿用，所以連點與斷線重試回到同一張編號。送出後內容有改，前台換新的 id。伺服器看到同一個 id、正規化後內容相同，回原來的編號與 `Idempotent-Replayed: true`；內容不同回 409，不寫第二筆。

**電話沿用第 1 步的格式。** `04-2000-0000` 這種市話可以，`+886` 與沒有分隔的手機不行。這是已知限制，不是忘了。要收國際號碼就要同時改前台、後端與文件，不能只放寬一邊。

**入庫時間是 UTC，編號年份與畫面上的時間是台北。** 跨年以 `Asia/Taipei` 為準，不把時差寫死成 +8。超過 9999 號就自然變成五位數，不跳號。

## 部署

GitHub Pages 與 Cloudflare 的靜態設定沿用第 1 步。這一步沒有把 API 部署到付費服務，也沒有執行 `wrangler deploy`。

- GitHub Pages：`.github/workflows/deploy-pages.yml` 在推上 `main` 時執行 `build:gh`。那是靜態檔，表單會走離線備案。
- Cloudflare Workers 靜態資源：`wrangler.jsonc` 名稱 `glossquote-labs-sme-website-demo`，自訂網域 `fineform.glossquote.com`。不要在沒有確認的情況下執行 `wrangler deploy`。

## 示意聲明

本站為作品集示範，公司、產品、客戶與聯絡資訊皆為虛構。設備只寫通用名稱（例如「五軸加工中心 A 型」），不代表任何真實廠牌。種子資料的 Email 都是 `.example`，電話都是 `04-2000-00xx`。
