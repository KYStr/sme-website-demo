# 驗證紀錄

日期：2026-10-30

環境：Windows，Node v24.14.0，npm 11.11.1。專案目錄 `sme-website-demo`。

## 寬度與頁面

兩種視窗：

- 360×800
- 1440×900

四個路由：

- `/` 首頁（含六站旅程：廠外、進廠、加工區、成品架、量測室、出貨區）
- `/products` 產品與服務
- `/about` 關於我們
- `/contact` 聯絡詢價

## 指令與結果

### `npm run build`

通過。`tsc -b && vite build` 沒有 TypeScript 錯誤。3D 程式在獨立的 `JourneyCanvas` chunk，其他頁面的主包不會先載入 Three.js。

### `npx playwright test`

2026-10-30 對 `vite preview`（`http://127.0.0.1:4174`）執行 `tests/smoke.spec.ts`。

6 passed（約 36.8 秒）。

每個寬度都檢查：

- 四個路由的 `document.documentElement.scrollWidth <= clientWidth`
- 主要導覽的四個連結可以切換路由（360px 會先打開漢堡選單）
- 聯絡頁空表單送出會出現「請填寫此欄位」
- 錯誤的 Email、電話會出現格式提示
- 格式正確時只出現「表單串接將於第 2 步完成，目前尚未送出」
- 畫面上沒有「已成功」或「送出成功」

### 截圖

`node scripts/capture.mjs` 對 preview `http://127.0.0.1:4173` 截圖，存於 `docs/screenshots/`。

首頁六站與另外三頁，360×800 與 1440×900 各一張，共 18 張。截圖前曾依畫面調整過鏡頭、霧、走道亮度、加工機外罩與標題斷行。

### 虛構資料掃描

在排除 `node_modules`、`dist`、截圖的範圍用 ripgrep：

- 機台與量具品牌（Mazak、DMG、MORI、Haas、Okuma、Fanuc、Brother、Zeiss、Mitutoyo、Makino、Sodick、Hexagon、Renishaw、Heidenhain、Yaskawa、三豐、馬扎克、發那科、大隈）：沒有相符。
- 電話樣式 `0d-dddd-dddd`：只有示範號碼 `04-2000-0000`。聯絡資訊寫成 `04-2000-0000（示意）`。表單 placeholder 與錯誤提示用同一個號碼當格式例子，沒有其他電話。

## 尚未在這一步做的事

沒有建立 GitHub repo，沒有 `git push`，沒有執行 `wrangler deploy`，也沒有打開線上網址。
