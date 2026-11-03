# 精睿精密工業 FineForm

虛構的台中精密加工廠示範網站。首頁用捲動把鏡頭帶進廠房：鐵捲門、CNC 加工區、成品架、量測室，最後停在出貨區。沒有後端，表單不會真的寄出。

**示意資料、非真實客戶。** 公司、產品、設備型號、客戶與聯絡資訊都是為作品集編的。電話 `04-2000-0000（示意）`，地址「台中市示範區虛構路 1 號（示意）」，Email `contact@fineform.example`。

## English summary

A front-end portfolio demo for a fictional Taichung CNC job shop, FineForm Precision. Four pages, Traditional Chinese copy, and a scroll-driven low-poly factory on the home page (Three.js, procedural geometry only). The inquiry form validates in the browser and then states that it has not been sent. Nothing here is a real company, client, or machine brand.

## 功能

- 四個頁面：首頁、產品與服務、關於我們、聯絡詢價
- 首頁六站捲動旅程：廠外、進廠、加工區、成品架、量測室、出貨區
- 主走道旁有 CNC 防護屏、工具櫃與棒材架；成品暫存、量測室與出貨區以地面標線和滑門分區
- 鏡頭沿 CatmullRom 曲線前進；滾輪每次定位一站，文字只顯示當前站，拖動與觸控捲動會自動靠站
- 不支援 WebGL，或系統開啟「減少動態效果」時，改為靜態廠房立面與直排內容
- 產品頁 8 個示意品項、程式繪製的藍圖線稿、分類篩選
- 關於頁沿革、通用型號設備表、品質流程
- 聯絡表單只做前端檢查；通過後顯示「表單串接將於第 2 步完成，目前尚未送出」

## 本機啟動

```bash
npm install
npm run dev
```

瀏覽器打開 Vite 顯示的本機網址。

```bash
npm run build
npm run preview
```

`npm run build` 的 base 是 `/`，給網域根目錄（例如 Cloudflare）用。

```bash
npm run build:gh
```

會以 `/sme-website-demo/` 建置，並把 `dist/index.html` 複製成 `dist/404.html`，給 GitHub Pages 的子路徑用。

```bash
npx playwright test --workers=1
```

煙霧測試會自己建置並開 preview，在 360×800 與 1440×900 檢查四個路由、導覽、表單，以及入口開門、滾輪反向、站點靠站與減少動態效果。六站的參訪方向、停站主體及工序關係見 [`docs/factory-route.md`](docs/factory-route.md)。12 張六站截圖在 [`docs/screenshots/`](docs/screenshots/)；開門短片、逐幀追蹤與獨立評分在 [`docs/verification.md`](docs/verification.md)。

## 部署

此目錄的部署設定已經寫好，但這一步沒有實際發布。

- GitHub Pages：`.github/workflows/deploy-pages.yml` 在推上 `main` 時執行 `build:gh`，再用 Pages artifact 部署。路由的 basename 讀 `import.meta.env.BASE_URL`。
- Cloudflare Workers 靜態資源：`wrangler.jsonc` 名稱 `glossquote-labs-sme-website-demo`，自訂網域 `fineform.glossquote.com`。不要在沒有確認的情況下執行 `wrangler deploy`。

## 示意聲明

本站為作品集示範，公司、產品、客戶與聯絡資訊皆為虛構。設備只寫通用名稱（例如「五軸加工中心 A 型」），不代表任何真實廠牌。
