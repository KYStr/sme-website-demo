export const company = {
  name: '精睿精密工業',
  nameEn: 'FineForm Precision Co., Ltd.',
  short: '精睿精密',
  tagline: '少量多樣，精度照圖。',
  positioning: '虛構的台中精密加工廠，承接 CNC 加工、精密零件訂製與快速打樣。',
  phone: '04-2000-0000（示意）',
  address: '台中市示範區虛構路 1 號（示意）',
  email: 'contact@fineform.example',
  hours: '週一至週五 08:30–17:30（示意）',
  disclaimer: '本站為作品集示範，公司、產品、客戶與聯絡資訊皆為虛構',
  founded: 2004,
}

export const highlights = [
  { value: '2004', label: '成立（示意）' },
  { value: '±0.01', label: 'mm 常規能力（示意）' },
  { value: '5–10', label: '天打樣（示意）' },
] as const

export const services = [
  {
    index: '01',
    title: 'CNC 加工',
    text: '車削、銑削，以及圖面上需要的二次加工。機台以通用型號標示，不綁特定廠牌。',
  },
  {
    index: '02',
    title: '精密零件訂製',
    text: '軸心、法蘭、軸襯、支架與治具板，依圖面完成可裝配的形狀。',
  },
  {
    index: '03',
    title: '少量多樣打樣',
    text: '單件到十數件。先確認做得到的公差，再排機，不把打樣當成插單。',
  },
] as const

export const reasons = [
  {
    title: '出貨前複檢',
    text: '關鍵尺寸在量測室確認後才裝箱。流程是示意，不是第三方認證。',
  },
  {
    title: '條件寫進工單',
    text: '材質、表面處理與交期留在同一張單上，不靠口頭記憶。',
  },
  {
    title: '交期按小批排',
    text: '打樣與小批量有自己的節奏。做不到的公差會先說，不畫大餅。',
  },
] as const

export const stats = [
  { value: '22', unit: '年', label: '自 2004 年起的加工年資（示意）' },
  { value: '32', unit: '人', label: '現場與品管同仁（示意）' },
  { value: '6', unit: '類', label: '自有加工與量測設備（示意）' },
  { value: '±0.01', unit: 'mm', label: '常規能力，視幾何而定（示意）' },
] as const
