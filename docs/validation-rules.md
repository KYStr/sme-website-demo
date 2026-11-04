# 詢價欄位規則

前台與 API 用同一份 [`shared/inquiry.ts`](../shared/inquiry.ts)。不是兩份抄寫後再對表。瀏覽器先擋一次，伺服器在寫入前再跑一次。用 curl 繞過前台，看到的是同一組錯誤碼。

正規化順序：Unicode NFC、詢問內容的 CRLF 與單獨的 CR 改成 LF、然後 trim。長度在正規化之後量，用 JavaScript 的 UTF-16 `.length`，與 `<input maxLength>` 相同。

除了詢問內容裡的換行（LF）與定位字元（tab），其他 C0 控制字元與 DEL 都拒絕。

| 欄位 | JSON 鍵 | 必填 | 上限 | 格式 |
| --- | --- | --- | --- | --- |
| 公司 | `company` | 是 | 100 | 文字 |
| 聯絡人 | `name` | 是 | 50 | 文字 |
| Email | `email` | 是 | 254 | `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| 電話 | `phone` | 是 | 20 | `^0\d{1,3}-\d{3,4}-\d{3,4}$`，例如 `04-2000-0000` |
| 主旨 | `subject` | 是 | 120 | 文字 |
| 詢問內容 | `message` | 是 | 2000 | 文字，可含換行與 tab |

六欄以外，送出時還帶這些鍵：

| 鍵 | 規則 |
| --- | --- |
| `submissionId` | UUID。用來把重試收成同一筆 |
| `formToken` | `/api/health` 發的簽章令牌 |
| `website` | 蜜罐。正常人留空。有內容就假裝成功、不入庫 |

缺欄位是 `required`。值不是字串是 `invalid_type`。`null` 也算型別錯誤。只有空白是 `required`。超長是 `too_long`，先於格式檢查。控制字元是 `invalid_chars`。

錯誤碼與前台句子：

| code | 客人看到的句子 |
| --- | --- |
| `required` | 請填寫此欄位 |
| `invalid_email` | 請輸入有效的 Email |
| `invalid_phone` | 請輸入有效的電話（例如 04-2000-0000） |
| `too_long` | 請縮短至 N 字以內（N 是該欄上限） |
| `invalid_chars` | 此欄位含有不允許的字元 |
| `invalid_type` | 此欄位必須是文字 |

422 的 `fields` 放的是 code，不是句子。前台再用這張表把 code 放回原本那一欄。

電話不收 `+886`、全形數字、或沒有分隔線的號碼。這是第 1 步就定下的格式，兩邊一起留著。

`<script>` 與 SQL 片段不是格式錯誤。它們當文字存，列表與單筆都以文字輸出，不組成 HTML。
