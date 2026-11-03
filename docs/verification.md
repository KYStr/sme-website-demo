# 驗證紀錄

日期：2026-10-30

環境：Windows，Node v24.14.0，npm 11.11.1。專案目錄 `sme-website-demo`。

## 2026-11-03：參訪動線、近景與停站動畫

- 六站依中央走道安排左右交替視線：入口向前、右側 CNC、左側樣品架、右側量測機、出貨隔間門口向內看打包區。桌面與手機共用通道；手機另調停站視線，避免窄畫幅把主體擠出。各站主體、工序和停站動作詳見 [`factory-route.md`](factory-route.md)。
- 樣品架移到左側，補架腳、層板墊、層位標籤，並以固定支架直立展示齒輪與法蘭；橋式量測機補花崗石台的支撐座、水平腳與示意零件法蘭；出貨區補手動拖板車負載輪和叉尖、棧板下層及紙箱封口，並重排檢核台與裝箱品。畫面文字改為介紹眼前的樣品、量測與打包內容。
- 加工站的刀軸進給及車床卡盤、量測站的探針滑座在停站後持續動；樣品架保持靜止。兩種寬度的正式版畫布截圖前後雜湊核對見 [`motion-check.json`](verification-media/motion-check.json)：加工與量測畫面變化，樣品架畫面不變，六項皆通過。
- 重拍 1440×900 與 360×800 的六站，共 12 張 [`screenshots/`](screenshots/)；目視檢查後三站主體與文案在雙寬度均可見。
- 獨立檢視者首輪指出量測台旁的路線太窄、手機出貨物件不全入鏡、探針缺少觸測順序。修正後以鏡頭曲線 200 點檢查 04→05 的位置：桌面與手機到量測台本體外緣的最小水平淨距約 0.975 m；手機 05 的檢核台、掃碼器、箱件與拖板車已在同一張截圖內。量測機改為 6 秒「移至示意零件上方、下降、抬起、退回」循環；[`動作短片`](verification-media/cmm-cycle-960x600.webm)與[靠近](verification-media/cmm-cycle-960x600-4-5s.png)、[觸測](verification-media/cmm-cycle-960x600-5s.png)、[抬起](verification-media/cmm-cycle-960x600-6s.png)定格可檢視探針與零件的相對位置。
- 完整 `npx playwright test --workers=1`：**15 passed、1 skipped**（5.1 分鐘）；`npm run build` 通過，`npm run lint` exit 0，只有既有的 React effect／immutability 警告。`git diff --check` 通過。桌面尺寸的觸控測試依原設定跳過。

### 本輪獨立複評

檢視者先給出具體缺陷，改動後分面向複評；下節七項 9.0/10 是前一輪版本的評分，不直接套用到這次動線與動畫改動。

| 面向 | 最終分數 | 可核對依據與限制 |
| --- | ---: | --- |
| 動線物理可信與左右交替 | 9.0/10 | 02 右、03 左、04 右、05 正前；04→05 維持走道偏左，量測台旁最小淨距約 0.975 m。 |
| 後三站近景精細度 | 9.0/10 | 03 直立齒輪齒形與法蘭孔雙寬度可辨；04 探針／台座、05 掃碼台／紙張／箱件清楚。仍是風格化示意模型。 |
| 桌面構圖 | 9.0/10 | 05 捲門對比降低、看點下移後檢核台、拖板車與箱件較醒目；左棧板作邊景部分出框。 |
| 手機構圖 | 9.0/10 | 03 B-12／A-07 標籤、齒輪法蘭、文案和四連結在 360×800 可讀；05 雙叉、掃碼檢核台與箱件同屏，右側箱件貼邊。 |
| 動作真實感與靜態架 | 9.0/10 | CMM 分段觸測短片與定格、雙寬度 motion-check 六項通過；定格只能檢查取樣時刻，不能證明每個中間幀。 |
| 文案與眼前物件對應 | 9.0/10 | 03 說明走道左側展示件；04 對應探針與示意零件；05 的掃碼、裝箱主體皆入鏡。 |

六項均達本輪 9/10 目標。檢視範圍是目前的風格化 3D 示範廠、最新截圖與受測裝置；其他設備與實際廠房配置仍需另行驗證。

## 2026-11-02：開門順暢度與靜態場景合批

- 將廠房外殼、分區、陳列架、出貨道具、CNC 機殼及量測機等**固定**箱體與圓柱，按材質、形狀與空間區域合為 GPU instancing；透明隔板和會動的主軸、卡盤、探針維持獨立。入口 13 片鋼製門片改為一組 instance，底部黃銅門片仍保有原材質。鏡頭朝向與門的第一個變化幀限制在 1/30 秒，後續慢幀上限 0.1 秒，避免突然躍過門口且能在較慢設備上停穩。
- 以無視窗 Chrome／Intel UHD Direct3D11 的開發版交錯 A/B trace 核對：未合批時停站約 690 draw calls、開門初期約 788；第一階段合批後約 549／613；[最終 profile](verification-media/door-entry-trace-chrome-headless-plain-1440x900-final-profile.json)約 361／392，減少約 48%／50%。參見 [`未合批 A/B`](verification-media/door-entry-trace-chrome-headless-plain-1440x900-unbatched-ab1.json)和[`合批 A/B`](verification-media/door-entry-trace-chrome-headless-plain-1440x900-batched-ab1.json)。不同輪次的幀時間仍受環境負載影響，不把單輪改善當成穩定 60 fps。
- 為消除停穩後仍持續渲染造成的慢幀，Canvas 改為按需渲染：捲動、觸控、站點按鈕喚醒場景，門／鏡頭過渡期間持續渲染，停穩後停止。修改前的 [CDP 診斷摘要](verification-media/cdp-longtask-summary.json)顯示停穩後仍有 172／86 ms 的 3D animation frame 任務；[按需渲染 profile](verification-media/door-entry-trace-chrome-headless-plain-1440x900-demand-profile-final.json)在 5 秒採樣期間記錄約 197 次實際 3D render，於約 3.27 秒停穩後不再重繪。
- 最終正式建置以無視窗 Chrome／Intel UHD Direct3D11、1440×900，每輪 5 秒測三次：[第 1 輪](verification-media/door-entry-trace-chrome-headless-plain-1440x900-demand-final-1.json)的 rAF 中位 17 ms／全程 p95 22 ms／最長 32 ms；[第 2 輪](verification-media/door-entry-trace-chrome-headless-plain-1440x900-demand-final-2.json) 17／21／31 ms；[第 3 輪](verification-media/door-entry-trace-chrome-headless-plain-1440x900-demand-final-3.json) 17／22／31 ms。三輪均無超過 33 ms 的 rAF 間隔，也沒有 PerformanceObserver 長任務；門開度均單調由 0 到 1。開門前 1.6 秒仍持續重繪，其 p95 為 24／21／22 ms、最長 32／28／24 ms。停站後採樣器的 rAF 仍會運作，**不代表 Canvas 繼續渲染**；這些數字也不保證其他裝置有相同幀時間。
- 重新以正式建置重拍 [`screenshots/`](screenshots/) 的 1440×900、360×800 六站，共 12 張；5 秒 [`開門短片`](verification-media/door-entry-clip-960x600.webm)可見門關閉、半開、淨空與鏡頭進廠，對照 [0.5 秒](verification-media/door-entry-clip-960x600-0-5s.png)、[1 秒](verification-media/door-entry-clip-960x600-1s.png)、[1.5 秒](verification-media/door-entry-clip-960x600-1-5s.png)定格。
- 最終 `npm run build` 通過；`npm run lint` exit 0，保留既有 `Header.tsx` effect 與 `FactoryScene.tsx` immutability 警告；`npx playwright test --workers=1` **15 passed、1 skipped**（4.0 分鐘）。新增靜止 3.8 秒後反向滾輪仍可喚醒場景並回到廠外的雙寬度驗證；跳過的是桌面尺寸的觸控測試。`git diff --check` 通過。

### 獨立複評

獨立檢視者只讀檢查最終 12 張雙寬度截圖、5 秒開門短片、三輪正式版 trace、按需渲染 profile、原始碼及 15 passed／1 skipped 測試紀錄。以下評分範圍是**風格化 3D 示範站與受測 Intel UHD 無視窗 Chrome**；9/10 是本輪目標，不代表寫實工廠或所有裝置皆已驗證。

| 面向 | 分數 | 可核對依據／限制 |
| --- | ---: | --- |
| 工廠空間真實感 | 9.0/10 | 六站依序由戶外、CNC、成品架、獨立量測室到出貨；QC 門框標示、橋架及中央動線分隔可見。低多邊形模型仍偏示意。 |
| 停站物件細節 | 9.0/10 | 最新雙寬度截圖可辨 CNC 控制屏與夾持、A-07／B-12 料盒零件、CMM 探針與面板、出貨檢核台／掃碼器／棧板；遠景細節較少。 |
| 照明與可讀性 | 9.0/10 | 12 張截圖中桌面與 360px 文案清楚，物件材質層次可辨；CNC 左側仍略沉。 |
| 鏡頭與開門動作 | 9.0/10 | 最新短片 0.5 秒門關、1 秒升起、1.5 秒進廠；trace 門開度 0→1、場景進度到 0.2，未見視覺硬切。960px 影片的資料列略有換行。 |
| 捲動與文字互動 | 9.0/10 | 滾輪立即定位站點，只有一張卡片可見；雙寬度的雙向滾輪、靜止後喚醒與開門測試納入 15 passed／1 skipped，截圖無標題疊字。仍未覆蓋所有觸控慣性與輸入裝置。 |
| 桌面與手機構圖 | 9.0/10 | 六站共 12 張雙尺寸截圖無新裁切，360px 下 CNC／CMM／出貨主體與文案同屏；部分機具邊緣因窄視窗出框。 |
| 效能與穩定性 | 9.0/10 | 三輪開門前 1.6 秒 p95 24／21／22 ms、最長 32／28／24 ms，無 >33 ms 採樣或長任務；停站後 3D renderCount 停在約 197。僅測 Intel UHD 無視窗 Chrome；停站後 rAF 採樣不是 Canvas FPS，實際有視窗與低階軟體 GPU 尚需監測。 |

七項皆達本輪 9/10 目標。修改前 CDP 的 172／86 ms 長任務僅供定位舊版持續渲染問題，並非現版的 CDP 後測；現版效能結論依三輪 trace 與按需渲染 profile。原備份資料夾與 zip 未修改，沒有部署。

## 2026-11-01：近景細節、開門與雙寬度複驗

- CNC 加工中心補上工作台 T 槽、夾具、刀軸、冷卻管、觀察窗框、控制面板與機殼細節；成品架加入軸件、法蘭、襯套、零件盤、料盒零件及庫位標籤；量測台加入花崗石格線、量測件、探針、導軌與讀值面板；出貨區加入封箱帶、貨運標籤、棧板車、捲門控制盒、防撞標示，以及桌面／手機皆可見的單據、掃碼器與檢核台。CNC 上方增設沿側邊的電力／氣壓橋架，量測室入口增設門框、門檻、把手與可讀標示；中央走道保持暢通。
- 入口捲門以獨立門片逐段升起；鏡頭、捲門與燈光共用受阻尼控制的可視進度。第 00→01 站不再以一次跳站略過門的中間位置。`data-scene-progress` 和 `data-door-open` 可供測試核對實際渲染狀態。
- 加工區、成品架、量測室與出貨區的局部光、環境光與材質亮度提高；手機版文案下方遮罩變淺。桌面 03–05 站的遮罩在 500 ms 內淡化，露出更多地坪、料盒與檢核區，保留文字陰影與對比。
- 站點按鈕先定位頁面，再讓鏡頭緩進；反向滾輪、手機觸控靠站與「減少動態效果」靜態六站內容都列入測試。兩張站點文案不會留在重疊狀態。
- 最終原始碼的 `npm run build` 通過；`npm run lint` exit 0，仍有 `Header.tsx` 的 effect 及 `FactoryScene.tsx` 的 React immutability 警告。最終原始碼的 `npx playwright test --workers=1`：**13 passed、1 skipped**（4.1 分鐘；跳過的是桌面尺寸的觸控測試）。另針對滾輪與入口門的四項測試單獨複跑，**4 passed**。
- 當輪六站畫面以無視窗 Chrome、Intel UHD／Direct3D11 拍攝；11／12／13 秒定格保留為 [`11 秒`](verification-media/door-entry-11s.png)、[`12 秒`](verification-media/door-entry-12s.png)、[`13 秒`](verification-media/door-entry-13s.png)。影片及首頁截圖已由 2026-11-02 的最終版取代，請以新章節的短片與 12 張截圖為準。
- 當輪 1440×900 trace 曾記錄 5.001 秒、158 幀：中位 31 ms、p95 38 ms、最長 110 ms、35 幀超過 33 ms；開門期間有一幀 76 ms。當輪原檔已由新 trace 取代，這些數值僅保留為歷史紀錄。有視窗 [`trace`](verification-media/door-entry-trace-chrome-plain-1440x900.json) 中位 25 ms、p95 34 ms、最長 87 ms；暫時停用新門框與橋架的 [`隔離 trace`](verification-media/door-entry-trace-chrome-headless-isolation-no-layout-1440x900.json) 仍慢，無法將波動單獨歸因於新幾何。

### 獨立複評

檢視者使用 12 張站點畫面、開門影片、追蹤紀錄、headless 雙寬度操作與完整測試結果評分；9/10 是目標，以下未達者照實保留。

| 面向 | 分數 | 可核對依據／限制 |
| --- | ---: | --- |
| 工廠空間真實感 | 9.0/10 | CNC 上方橋架接入機台，量測室入口有門框、門檻與標示；中央通道沒有被佔用。 |
| 停站物件細節 | 9.0/10 | CNC、量測台、成品架料盒與出貨檢核台在雙寬度可辨；螢幕與掃碼器仍保留簡化的程式幾何風格。 |
| 照明與可讀性 | 9.0/10 | 03–05 地坪、料盒、工作台與檢核區更清楚，主文案仍可讀；04 第三行的局部對比較弱。 |
| 鏡頭與開門動作 | 8.8/10 | 影片呈現門半開、門清空、進廠的先後；最後一輪 trace 開門期間有 76 ms 慢幀。 |
| 捲動與文字互動 | 9.0/10 | 00→01→02→01 每次只見一張卡片；觸控、按鈕與減少動態效果測試通過。 |
| 桌面與手機構圖 | 9.0/10 | 雙尺寸六站均可看清主體，文案無裁切。 |
| 效能與穩定性 | 8.2/10 | 最後一輪無視窗 Intel UHD 中位 31 ms、p95 38 ms、最慢幀 110 ms；不同輪次波動明顯。 |

這一輪有五項達 9/10，尚未達成七項全部至少 9/10；剩餘限制是低效能或負載波動時的幀時間尖峰，可能讓開門鏡頭短暫頓挫。原備份資料夾與 zip 未修改，沒有部署。

## 2026-10-31：工廠分區與捲動修正

- 3D 動線加入中央走道、加工位防護屏、工具櫃、棒材架、成品暫存區、量測室滑門與出貨捲門。量測室前後各有隔間，出貨區棧板不再從量測站直接可見。
- 滾輪每次定位一站，鏡頭以阻尼接續移動；卡片同時只顯示當前站。直接拖動或觸控捲動停在站點之間時會自動靠站。捲動事件同步更新鏡頭進度與文字，避免高負載下文字落後。
- `npm run build` 通過；`npm run lint` exit 0，只有原有的 React immutability 與 Header effect 警告。
- `npx playwright test --workers=1`：8 passed（約 2.1 分鐘）。新增測試在 360×800 與 1440×900 驗證連續兩次滾輪輸入會到正確站、只顯示一張站點卡片，以及直達第 05 站時顯示出貨卡片。
- 更新 `docs/screenshots/home-*` 的 12 張首頁截圖；目視確認手機版進廠與加工站的最後一列不再被底部裁掉，第 05 站顯示出貨捲門與棧板。
- 完成細節修正後再跑兩個寬度的滾輪測試：2 passed。獨立檢視者最後看過 03–05 站六張新截圖，評為 8.5/10，未見文字裁切、疊字或明顯構圖退步。

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
