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
    body: '從入口沿中央走道進廠，左右分開加工、樣品、量測與出貨。試製與小批量，比的是尺寸與交期能否說到做到。',
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
    title: '樣品架上\n看得到形狀',
    body: '走道左側展示軸心、法蘭、齒輪與治具板；架上料盒及尺寸都是示意。',
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
    title: '量過尺寸\n才準備出貨',
    reasons: [
      { title: '橋式量測機', text: '探針逐點確認示意零件的關鍵尺寸。' },
      { title: '出貨前複檢', text: '量測結果與材料條件一起核對。' },
      { title: '記錄跟著工單', text: '小批量也保留檢驗依據。' },
    ],
  },
  {
    id: 'ship',
    index: '05',
    kicker: '05  出貨區',
    title: '掃碼、裝箱\n準備出貨',
    body: '棧板上已裝箱，檢核台旁待掃碼。寫下材料、數量與期限；示範表單目前不會寄出。',
    cta: { label: '立即詢價', to: '/contact' },
  },
]
