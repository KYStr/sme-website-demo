export type ProductCategory = 'turning' | 'milling' | 'hybrid' | 'service'

export type Product = {
  id: string
  name: string
  category: ProductCategory
  material: string
  tolerance: string
  finish: string
  leadTime: string
  summary: string
  description: string
}

export const categoryFilters = [
  { id: 'all', label: '全部' },
  { id: 'turning', label: '車削' },
  { id: 'milling', label: '銑削' },
  { id: 'hybrid', label: '車銑複合' },
  { id: 'service', label: '服務' },
] as const

export const categoryLabel: Record<ProductCategory, string> = {
  turning: '車削',
  milling: '銑削',
  hybrid: '車銑複合',
  service: '服務',
}

export const products: Product[] = [
  {
    id: 'shaft',
    name: '精密軸心',
    category: 'turning',
    material: 'S45C／SUS304（示意）',
    tolerance: '外徑 ±0.01 mm（示意）',
    finish: '研磨 Ra 0.8（示意）',
    leadTime: '7–10 工作天（示意）',
    summary: '階梯軸，含退刀槽與軸端螺紋。',
    description: '用於傳動與定位。先確認支承段與螺紋退刀，再談熱處理是否委外。',
  },
  {
    id: 'flange',
    name: '法蘭盤',
    category: 'turning',
    material: 'S45C／A5052（示意）',
    tolerance: '止口 ±0.02 mm（示意）',
    finish: '車削 Ra 1.6（示意）',
    leadTime: '7–12 工作天（示意）',
    summary: '盤面、止口與螺栓孔一次完成。',
    description: '適合連接面與密封面。螺栓孔分度依圖，不另附真實檢測報告。',
  },
  {
    id: 'bushing',
    name: '軸襯',
    category: 'turning',
    material: '青銅／SUS（示意）',
    tolerance: '內徑 ±0.01 mm（示意）',
    finish: '鉸孔 Ra 0.8（示意）',
    leadTime: '6–10 工作天（示意）',
    summary: '短套筒，看內徑圓度與端面垂直。',
    description: '小批量替換件。油溝與倒角會在評圖時先標出來。',
  },
  {
    id: 'bracket',
    name: '鋁合金支架',
    category: 'milling',
    material: 'A6061-T6（示意）',
    tolerance: '孔距 ±0.05 mm（示意）',
    finish: '陽極前銑削（示意）',
    leadTime: '8–12 工作天（示意）',
    summary: '輕量化支架，含沉頭孔與避空。',
    description: '薄壁件會先看變形。陽極顏色與膜厚若要指定，交期另計（示意）。',
  },
  {
    id: 'nozzle',
    name: '噴嘴',
    category: 'hybrid',
    material: 'SUS303（示意）',
    tolerance: '噴口 ±0.02 mm（示意）',
    finish: '內孔去毛邊（示意）',
    leadTime: '8–14 工作天（示意）',
    summary: '錐段與細孔，車銑配合完成流道。',
    description: '流道去毛邊比外型更花時間。打樣階段會先確認最小孔徑做不做得到。',
  },
  {
    id: 'gear',
    name: '齒輪',
    category: 'milling',
    material: 'SCM415（示意）',
    tolerance: '齒厚依圖（示意）',
    finish: '去毛邊（示意）',
    leadTime: '10–15 工作天（示意）',
    summary: '小模數直齒，供機構打樣與小批替換。',
    description: '熱處理委外（示意）。此頁不提供真實精度等級證書。',
  },
  {
    id: 'plate',
    name: '治具板',
    category: 'milling',
    material: 'S50C（示意）',
    tolerance: '孔位置 ±0.02 mm（示意）',
    finish: '基準面研磨 Ra 0.4（示意）',
    leadTime: '10–16 工作天（示意）',
    summary: '基準面先研磨，孔位再依夾持圖加工。',
    description: '銷孔與牙孔分開標註會比較快。大板厚會影響交期（示意）。',
  },
  {
    id: 'prototype',
    name: '快速打樣服務',
    category: 'service',
    material: '依圖面（示意）',
    tolerance: '依圖面，先確認做得到的範圍',
    finish: '依圖面（示意）',
    leadTime: '5–10 工作天（示意）',
    summary: '單件到十數件。先做對，再談批量。',
    description: '請附圖面、數量與希望交期。做不到的公差會在回覆裡直接寫，不先答應。',
  },
]
