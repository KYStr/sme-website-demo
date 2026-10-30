import { highlights } from './company.ts'

export type JourneyStation = {
  id: string
  index: string
  kicker: string
  title: string
  body?: string
  note?: string
  stats?: readonly { value: string; label: string }[]
  services?: readonly { title: string; text: string }[]
  links?: readonly { label: string; to: string }[]
  reasons?: readonly { title: string; text: string }[]
  cta?: { label: string; to: string }
}

export const journeyStations: JourneyStation[] = [
  {
    id: 'exterior',
    index: '00',
    kicker: 'FineForm · Taichung',
    title: '精睿精密工業',
    body: '少量多樣，精度照圖。',
    note: 'CNC 加工、精密零件訂製、快速打樣。這是一座虛構的台中示範廠。',
  },
  {
    id: 'gate',
    index: '01',
    kicker: '01  進廠',
    title: '先答應\n做得到的公差',
    body: '試製與小批量是本業。不跟量產廠比產能，比的是尺寸穩不穩、交期答不答得準。',
    stats: highlights,
  },
  {
    id: 'cnc',
    index: '02',
    kicker: '02  加工區',
    title: '三件事\n可以下單',
    services: [
      { title: 'CNC 加工', text: '車削、銑削，與圖面需要的二次加工。' },
      { title: '精密零件訂製', text: '軸心、法蘭、支架，依圖完成。' },
      { title: '少量多樣打樣', text: '單件到十數件，先做對再談批量。' },
    ],
  },
  {
    id: 'rack',
    index: '03',
    kicker: '03  成品架',
    title: '架上是示意品項',
    body: '這四件常出現在打樣單裡。規格在產品頁，數字都是示意。',
    links: [
      { label: '精密軸心', to: '/products#shaft' },
      { label: '法蘭盤', to: '/products#flange' },
      { label: '齒輪', to: '/products#gear' },
      { label: '治具板', to: '/products#plate' },
    ],
  },
  {
    id: 'cmm',
    index: '04',
    kicker: '04  量測室',
    title: '選我們的理由\n很樸素',
    reasons: [
      { title: '出貨前複檢', text: '關鍵尺寸量過，才進箱子。' },
      { title: '條件寫進工單', text: '材質與表面處理不靠記憶。' },
      { title: '交期按小批排', text: '打樣有自己的節奏，不畫大餅。' },
    ],
  },
  {
    id: 'ship',
    index: '05',
    kicker: '05  出貨區',
    title: '下一站是\n你的收貨區',
    body: '寫下材料、數量與期限。示範表單現在不會寄出。',
    cta: { label: '立即詢價', to: '/contact' },
  },
]
