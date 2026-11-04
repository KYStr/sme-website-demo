# 詢價 API

基底路徑 `/api`。成功與失敗都是 JSON，`Content-Type: application/json; charset=utf-8`。每個回應都有 `X-Request-Id`、`Cache-Control: no-store`、`X-Content-Type-Options: nosniff`、`Referrer-Policy: no-referrer`。錯誤不帶 stack。

錯誤形狀：

```json
{
  "error": { "code": "validation_failed", "message": "請修正標示的欄位", "fields": { "email": "invalid_email" } },
  "requestId": "…"
}
```

`fields` 只在欄位錯誤時出現。本文上限 32 KiB。`Content-Type` 必須是 `application/json`，編碼只收 UTF-8。不是 JSON 物件的本文回 400 `invalid_body`。

CORS 只回許可清單裡的 origin，並帶 `Vary: Origin`。不在清單裡回 403 `origin_not_allowed`。預檢成功是 204。

SQL 全部是參數化查詢。

## `GET /api/health`

給前台判斷 API 是否真的在。200：

```json
{ "status": "ok", "version": "0.2.0", "db": "ok", "time": "2026-11-04T12:00:00.000Z", "formToken": "<毫秒>.<hex>" }
```

`time` 是 UTC。`formToken` 由伺服器簽入發出時刻。資料庫打不開時回 503，`status` 為 `degraded`，`db` 為 `error`，沒有令牌，也不附上內部錯誤文字。

## `POST /api/inquiries`

新增一筆詢問。處理順序：

1. 本文與 JSON
2. `submissionId` 必須是 UUID，否則 422，`fields.submissionId` 為 `invalid_submission_id`
3. 這個 id 已經有一筆：正規化後內容相同，回 201 與原編號，並加 `Idempotent-Replayed: true`；內容不同，回 409 `submission_conflict`
4. 同一個 IP 十分鐘內已有 5 次新的嘗試：429 `rate_limited`，`Retry-After` 是秒數
5. `website` 有值，或令牌年齡未滿 2 秒：201，形狀與真成功相同，不入庫
6. 令牌簽章錯、來自未來、或超過 24 小時：422 `form_expired`
7. 欄位驗證失敗：422 `validation_failed`
8. 寫入並發號：201

真成功：

```json
{ "ticket": "FF-2026-0001", "status": "new", "createdAt": "2026-11-04T12:00:00.000Z" }
```

`createdAt` 是 UTC。編號的年份是寫入當下的台北年份。不回資料庫 id，避免和假成功的形狀分叉。

## `GET /api/inquiries`

要管理金鑰。查詢參數：

| 參數 | 規則 |
| --- | --- |
| `page` | 預設 1。必須是正整數，否則 400 `invalid_query` |
| `status` | `new`、`read`、`archived` 之一。省略表示全部 |
| `q` | 關鍵字，去掉空白後最長 100。比對公司、聯絡人、主旨、內容、編號。`%` 與 `_` 是字面 |

每頁 10 筆，`created_at DESC, id DESC`。超出最後一頁回空陣列，不是 404。

```json
{
  "page": 1,
  "pageSize": 10,
  "total": 12,
  "items": [
    {
      "id": 12,
      "ticket": "FF-2026-0011",
      "company": "龍井打樣行（示意）",
      "name": "示範12",
      "emailMasked": "b***@workshop12.example",
      "phoneMasked": "***0012",
      "subject": "…",
      "status": "new",
      "source": "seed",
      "createdAt": "2026-11-03T08:00:00.000Z"
    }
  ]
}
```

列表沒有 Email 原文、電話原文、詢問內容。

## `GET /api/inquiries/:id`

要管理金鑰。`id` 是數字主鍵。找不到、或不是正整數，回 404 `not_found`。讀取不會把狀態改成已讀。

回傳含 `email`、`phone`、`message`。`message` 以純文字保存，回應也是 JSON 字串。

## `PATCH /api/inquiries/:id`

要管理金鑰。本文 `{ "status": "read" }`。`status` 不是三個值之一，回 422，`fields.status` 為 `invalid_status`。

| 目前 | 可以改成 |
| --- | --- |
| `new` 新進 | `read` 已讀、`archived` 已封存 |
| `read` 已讀 | `archived` 已封存 |
| `archived` 已封存 | `read` 已讀 |

改成目前的狀態回 200，不寫入。不允許的方向回 409 `invalid_transition`。更新條件帶著原本的狀態，所以兩個管理者同時改同一筆時，後寫入的那次若已經對不上，也是 409，不會蓋掉對方。

沒有 `DELETE`。對單筆送 `DELETE` 回 405，`Allow: GET, PATCH`。封存不是刪除。

## 管理金鑰

`Authorization: Bearer <ADMIN_KEY>`。

| 情況 | 狀態 | code |
| --- | --- | --- |
| 未設定金鑰，或少於 16 字元 | 503 | `admin_disabled` |
| 沒帶、或帶錯 | 401 | `unauthorized` |
| 同一個 IP 十分鐘內錯誤達到 10 次 | 429 | `rate_limited` |

金鑰錯誤的 429 訊息寫的是金鑰，不是表單次數。鎖住期間，正確金鑰也要等窗口過去。

## 狀態碼一覽

| 狀態 | 何時 |
| --- | --- |
| 200 | 健康、列表、單筆、狀態更新 |
| 201 | 新詢問，或機器人的假成功，或冪等重送 |
| 204 | CORS 預檢 |
| 400 | 壞 JSON、本文不是物件、查詢參數不合法、網址無法解讀 |
| 401 | 管理金鑰缺失或錯誤 |
| 403 | origin 不在許可清單 |
| 404 | 路徑或單筆不存在 |
| 405 | 方法不支援，帶 `Allow` |
| 409 | 同一個 submission id 但內容不同，或不允許的狀態變更 |
| 413 | 本文超過 32 KiB |
| 415 | 不是 JSON，或編碼不是 UTF-8 |
| 422 | 欄位驗證失敗，或表單令牌不能用 |
| 429 | 詢問太頻繁，或管理金鑰錯誤太多次 |
| 500 | 未預期的錯誤。本文只有「伺服器發生錯誤」 |
| 503 | 健康檢查時資料庫壞了，或管理 API 沒有啟用 |
