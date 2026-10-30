type DrawingProps = {
  id: string
  title: string
  className?: string
}

export function PartDrawing({ id, title, className }: DrawingProps) {
  return (
    <svg className={className} viewBox="0 0 360 230" role="img" aria-label={`${title}示意線稿`}>
      <rect x="10" y="10" width="340" height="210" fill="none" stroke="currentColor" strokeWidth="1" />
      <path
        d="M10 10h18M10 10v18M350 10h-18M350 10v18M10 220h18M10 220v-18M350 220h-18M350 220v-18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <DrawingBody id={id} />
      <text x="20" y="206" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        {title} · 示意
      </text>
      <text x="292" y="206" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        1:1
      </text>
    </svg>
  )
}

function DrawingBody({ id }: { id: string }) {
  if (id === 'shaft') return <Shaft />
  if (id === 'flange') return <Flange />
  if (id === 'bushing') return <Bushing />
  if (id === 'bracket') return <Bracket />
  if (id === 'nozzle') return <Nozzle />
  if (id === 'gear') return <Gear />
  if (id === 'plate') return <Plate />
  return <Prototype />
}

function Shaft() {
  return (
    <g fill="none" stroke="currentColor">
      <path d="M48 116 H300" strokeDasharray="6 4" strokeWidth="1" />
      <path d="M64 116 V98 H108 V86 H196 V104 H286 V128 H196 V146 H108 V134 H64 V116 Z" strokeWidth="1.6" />
      <path d="M64 72 V64 M286 72 V64 M64 64 H286" strokeWidth="1" />
      <path d="M64 64 l5 4 M64 64 l5 -4 M286 64 l-5 4 M286 64 l-5 -4" strokeWidth="1" />
      <text x="160" y="56" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        L（示意）
      </text>
      <text x="150" y="168" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        Ø ±0.01
      </text>
    </g>
  )
}

function Flange() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="168" cy="108" r="58" />
      <circle cx="168" cy="108" r="36" strokeDasharray="4 3" />
      <circle cx="168" cy="108" r="14" />
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2 - Math.PI / 2
        const x = 168 + Math.cos(angle) * 36
        const y = 108 + Math.sin(angle) * 36
        return <circle key={index} cx={x} cy={y} r="5" />
      })}
      <path d="M240 70 H300 M240 70 V108" strokeWidth="1" />
      <text x="248" y="66" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        PCD
      </text>
    </g>
  )
}

function Bushing() {
  const hatchId = 'hatch-bushing'
  return (
    <g fill="none" stroke="currentColor">
      <defs>
        <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="0.7" />
        </pattern>
      </defs>
      <path d="M70 116 H290" strokeDasharray="5 4" strokeWidth="1" />
      <rect x="110" y="78" width="36" height="76" fill={`url(#${hatchId})`} strokeWidth="1.4" />
      <rect x="214" y="78" width="36" height="76" fill={`url(#${hatchId})`} strokeWidth="1.4" />
      <path d="M146 78 H214 M146 154 H214" strokeWidth="1.4" />
      <text x="180" y="64" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        內徑（示意）
      </text>
    </g>
  )
}

function Bracket() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M78 150 H230 V118 H118 V70 H78 Z" />
      <circle cx="168" cy="134" r="8" />
      <circle cx="98" cy="96" r="7" />
      <path d="M78 164 H230" strokeWidth="1" />
      <text x="140" y="184" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        孔距（示意）
      </text>
    </g>
  )
}

function Nozzle() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M70 108 H120 V92 H190 L250 104 V112 L190 124 H120 V108" />
      <path d="M70 108 H300" strokeDasharray="5 4" strokeWidth="1" />
      <path d="M250 88 V128" strokeWidth="1" />
      <text x="250" y="78" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        噴口
      </text>
    </g>
  )
}

function Gear() {
  const teeth = 16
  const cx = 168
  const cy = 108
  let path = ''
  for (let index = 0; index < teeth; index += 1) {
    const a0 = (index / teeth) * Math.PI * 2
    const a1 = ((index + 0.18) / teeth) * Math.PI * 2
    const a2 = ((index + 0.45) / teeth) * Math.PI * 2
    const a3 = ((index + 0.63) / teeth) * Math.PI * 2
    const point = (angle: number, radius: number) =>
      `${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`
    path += `${index === 0 ? 'M' : 'L'} ${point(a0, 46)} L ${point(a1, 58)} L ${point(a2, 58)} L ${point(a3, 46)} `
  }
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d={path + 'Z'} />
      <circle cx={cx} cy={cy} r="28" strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r="10" />
      <path d={`M${cx} 40 V${cy - 14} M${cx} ${cy + 14} V176 M110 ${cy} H${cx - 14} M${cx + 14} ${cy} H228`} strokeWidth="1" />
    </g>
  )
}

function Plate() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="78" y="62" width="200" height="120" />
      {[-1, 1].map((row) =>
        [-1, 0, 1].map((col) => (
          <circle key={`${row}${col}`} cx={178 + col * 52} cy={122 + row * 32} r="7" />
        )),
      )}
      <path d="M78 196 H278" strokeWidth="1" />
      <text x="178" y="48" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        孔位（示意）
      </text>
    </g>
  )
}

function Prototype() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="48" y="78" width="70" height="70" />
      <path d="M132 113 H168" />
      <path d="M158 104 l12 9 l-12 9" />
      <path d="M188 113 V96 H250 V88 H300 V138 H250 V130 H188 Z" />
      <text x="83" y="168" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        來圖
      </text>
      <text x="244" y="168" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="Outfit, sans-serif">
        打樣
      </text>
    </g>
  )
}
