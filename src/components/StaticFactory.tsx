import styles from './StaticFactory.module.css'

export function StaticFactory() {
  return (
    <figure className={styles.figure}>
      <svg viewBox="0 0 960 520" role="img" aria-label="精睿精密廠房立面示意">
        <rect width="960" height="520" fill="#14171a" />
        <g stroke="#8fb4c4" strokeWidth="1" opacity="0.35">
          {Array.from({ length: 18 }, (_, index) => (
            <line key={`v${index}`} x1={40 + index * 50} y1="36" x2={40 + index * 50} y2="470" />
          ))}
          {Array.from({ length: 9 }, (_, index) => (
            <line key={`h${index}`} x1="30" y1={40 + index * 50} x2="930" y2={40 + index * 50} />
          ))}
        </g>
        <g fill="none" stroke="#d4b06a" strokeWidth="1.4">
          <path d="M70 70h28M70 70v28M890 70h-28M890 70v28M70 450h28M70 450v-28M890 450h-28M890 450v-28" />
        </g>
        <path d="M90 392h780" stroke="#9ec9d8" strokeWidth="1.2" />
        {Array.from({ length: 21 }, (_, index) => (
          <line
            key={index}
            x1={110 + index * 36}
            y1="392"
            x2={110 + index * 36}
            y2={index % 5 === 0 ? 378 : 384}
            stroke="#d4b06a"
            strokeWidth="1.2"
          />
        ))}
        <text x="120" y="428" fill="#d4b06a" fontFamily="Outfit, sans-serif" fontSize="14">
          14.0 m（示意）
        </text>
        <rect x="150" y="118" width="660" height="274" fill="#23282e" stroke="#d4b06a" strokeWidth="2" />
        <rect x="150" y="104" width="660" height="16" fill="#1b2025" stroke="#d4b06a" strokeWidth="1" />
        <rect x="168" y="132" width="624" height="8" fill="#d4b06a" />
        {Array.from({ length: 8 }, (_, index) => (
          <rect key={index} x={176 + index * 76} y="148" width="48" height="22" fill="#ffb15e" opacity="0.85" />
        ))}
        <rect x="360" y="214" width="240" height="178" fill="#101316" stroke="#8d6d38" strokeWidth="3" />
        {Array.from({ length: 9 }, (_, index) => (
          <line key={index} x1="372" y1={228 + index * 18} x2="588" y2={228 + index * 18} stroke="#3e4650" strokeWidth="8" />
        ))}
        <text x="480" y="198" textAnchor="middle" fill="#f3efe6" fontSize="28" fontFamily="Noto Sans TC, sans-serif">
          精睿精密
        </text>
        <text x="480" y="248" textAnchor="middle" fill="#d4b06a" fontSize="12" fontFamily="Outfit, sans-serif" letterSpacing="3">
          FINEFORM
        </text>
        <text x="168" y="360" fill="#9ec9d8" fontSize="13" fontFamily="Outfit, sans-serif">
          ELEVATION 01 · 示意
        </text>
      </svg>
      <figcaption className={styles.caption}>廠房立面示意。此畫面不含即時 3D。</figcaption>
    </figure>
  )
}
