// 生成静态地图底图 SVG（省份 + 羊皮纸背景 + 罗盘线）
// 用一次预渲染替代运行时 34+ 个 Konva Path 的实时解析，大幅提升 GameMap 首帧加载速度
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ======== 1. 提取 PROVINCE_DATA 和 provinceToPathData ========

const srcPath = path.join(__dirname, 'src', 'data', 'chinaGeoData.ts')
const src = fs.readFileSync(srcPath, 'utf-8')

// 提取常量
const wMatch = src.match(/CANVAS_WIDTH\s*=\s*(\d+)/)
const hMatch = src.match(/CANVAS_HEIGHT\s*=\s*(\d+)/)
const W = wMatch ? parseInt(wMatch[1]) : 802
const H = hMatch ? parseInt(hMatch[1]) : 433

// 提取 TARGET_PROVINCES
const tpMatch = src.match(/LONG_MARCH_PROVINCES\s*=\s*(\[[\s\S]*?\]);/)
const TP = tpMatch ? eval(tpMatch[1]) : []

// 提取 PROVINCE_DATA
const pdMatch = src.match(/export const PROVINCE_DATA: ProvincePath\[\]\s*=\s*\[([\s\S]*?)\n\];/)
if (!pdMatch) { console.error('无法提取 PROVINCE_DATA'); process.exit(1) }
const data = eval('[' + pdMatch[1] + ']')

// 复制 provinceToPathData 逻辑
function provinceToPathData(polygon) {
  const parts = []
  for (const ring of [polygon.outer, ...polygon.holes]) {
    if (ring.length === 0) continue
    parts.push('M ' + ring[0][0] + ' ' + ring[0][1] + ' ' +
      ring.slice(1).map(p => 'L ' + p[0] + ' ' + p[1]).join(' ') + ' Z')
  }
  return parts.join(' ')
}

// ======== 2. 羊皮纸边框 ========

function srng(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const PARCHMENT_MARGIN = 18
const LEFT = PARCHMENT_MARGIN
const TOP = PARCHMENT_MARGIN
const RIGHT = W - PARCHMENT_MARGIN
const BOTTOM = H - PARCHMENT_MARGIN
const JITTER = 6

function parchmentBorderPath() {
  const segs = 24
  const w = RIGHT - LEFT, h = BOTTOM - TOP
  let d = `M ${LEFT + srng(1) * JITTER} ${TOP + srng(2) * JITTER}`
  for (let i = 1; i <= segs; i++)
    d += ` L ${LEFT + (i/segs) * w} ${TOP + srng(i * 3) * JITTER - JITTER / 2}`
  for (let i = 1; i <= segs; i++)
    d += ` L ${RIGHT + srng(i * 3 + 100) * JITTER - JITTER / 2} ${TOP + (i/segs) * h}`
  for (let i = segs; i >= 1; i--)
    d += ` L ${LEFT + (i/segs) * w} ${BOTTOM + srng(i * 3 + 200) * JITTER - JITTER / 2}`
  for (let i = segs; i >= 1; i--)
    d += ` L ${LEFT + srng(i * 3 + 300) * JITTER - JITTER / 2} ${TOP + (i/segs) * h}`
  d += ' Z'
  return d
}

// 褶皱线
const CREASE_LINES = [
  { x1: 120, y1: 0, x2: 180, y2: H },
  { x1: W * 0.6, y1: 0, x2: W * 0.55, y2: H },
  { x1: 0, y1: H * 0.45, x2: W, y2: H * 0.48 },
]

// ======== 3. 罗盘线 ========

function rhumbLines() {
  const cx = W * 0.42
  const cy = H * 0.38
  const R = Math.max(W, H) * 1.3
  const lines = []
  for (const deg of [0, 30, 45, 60, 90, 120, 135, 150]) {
    const rad = (deg * Math.PI) / 180
    const opacity = deg % 45 === 0 ? 0.06 : 0.03
    lines.push(
      `<line x1="${(cx - Math.cos(rad) * R).toFixed(1)}" y1="${(cy - Math.sin(rad) * R).toFixed(1)}" ` +
      `x2="${(cx + Math.cos(rad) * R).toFixed(1)}" y2="${(cy + Math.sin(rad) * R).toFixed(1)}" ` +
      `stroke="rgba(120,85,50,${opacity.toFixed(2)})" stroke-width="0.5" />`
    )
  }
  return lines.join('\n    ')
}

// ======== 4. 生成 SVG ========

const BORDER = parchmentBorderPath()

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <clipPath id="parchment-clip">
      <path d="${BORDER}" />
    </clipPath>
    <radialGradient id="aging" cx="${(W * 0.45 / W * 100).toFixed(1)}%" cy="${(H * 0.4 / H * 100).toFixed(1)}%">
      <stop offset="0%" stop-color="rgba(180,140,100,0)" />
      <stop offset="45%" stop-color="rgba(150,110,70,0.06)" />
      <stop offset="75%" stop-color="rgba(120,80,50,0.12)" />
      <stop offset="100%" stop-color="rgba(80,45,25,0.30)" />
    </radialGradient>
    <linearGradient id="stain" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(110,70,35,0.10)" />
      <stop offset="20%" stop-color="rgba(100,60,30,0)" />
      <stop offset="35%" stop-color="rgba(130,85,45,0.06)" />
      <stop offset="55%" stop-color="rgba(90,50,25,0)" />
      <stop offset="70%" stop-color="rgba(120,75,40,0.08)" />
      <stop offset="85%" stop-color="rgba(100,60,30,0)" />
      <stop offset="100%" stop-color="rgba(80,40,20,0.06)" />
    </linearGradient>
  </defs>

  <!-- 底色 -->
  <rect width="${W}" height="${H}" fill="#120a05" />

  <!-- 羊皮纸填充 -->
  <path d="${BORDER}" fill="#e6d3b0" clip-path="url(#parchment-clip)" />

  <!-- 羊皮纸边缘多层边框 -->
  <path d="${BORDER}" fill="none" stroke="rgba(60,30,10,0.30)" stroke-width="14" />
  <path d="${BORDER}" fill="none" stroke="rgba(60,30,10,0.15)" stroke-width="22" />
  <path d="${BORDER}" fill="none" stroke="#8b7355" stroke-width="2.5" />

  <!-- 罗盘线（裁剪到羊皮纸内，位于省份之下） -->
  <g clip-path="url(#parchment-clip)">
    ${rhumbLines()}
  </g>

  <!-- 省份（裁剪到羊皮纸内） -->
  <g clip-path="url(#parchment-clip)">
    ${data.map(prov => {
      return prov.polygons.map(poly => {
        const d = provinceToPathData(poly)
        return `<path d="${d}" fill="#c4ab8a" fill-rule="evenodd" stroke="rgba(92,61,46,0.22)" stroke-width="0.6" opacity="0.9" stroke-linejoin="round" />`
      }).join('\n    ')
    }).join('\n    ')}
  </g>

  <!-- 羊皮纸老化效果（覆盖在省份之上，让边缘做旧） -->
  <rect x="${PARCHMENT_MARGIN + 4}" y="${PARCHMENT_MARGIN + 4}"
    width="${W - (PARCHMENT_MARGIN + 4) * 2}" height="${H - (PARCHMENT_MARGIN + 4) * 2}"
    fill="url(#aging)" />

  <!-- 褶皱线（覆盖在省份之上） -->
  ${CREASE_LINES.map(l =>
    `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="rgba(90,55,30,0.06)" stroke-width="1.5" />`
  ).join('\n  ')}

  <!-- 污渍渐变（覆盖在省份之上） -->
  <rect x="${PARCHMENT_MARGIN + 4}" y="${PARCHMENT_MARGIN + 4}"
    width="${W - (PARCHMENT_MARGIN + 4) * 2}" height="${H - (PARCHMENT_MARGIN + 4) * 2}"
    fill="url(#stain)" />

  <!-- 省份标签已移除，由 Konva NodeLabel 统一管理 -->

  <!-- 罗盘标尺 -->
  <g transform="translate(${W - 52}, 65)">
    <circle r="20" fill="rgba(244,228,193,0.2)" stroke="#8b7355" stroke-width="1.5" />
    <line x1="0" y1="-18" x2="0" y2="18" stroke="#3b2a1a" stroke-width="2" opacity="0.6" />
    <line x1="-18" y1="0" x2="18" y2="0" stroke="#5c3d2e" stroke-width="2" opacity="0.4" />
    <line x1="-12" y1="-12" x2="12" y2="12" stroke="#8b7355" stroke-width="1" opacity="0.2" />
    <line x1="12" y1="-12" x2="-12" y2="12" stroke="#8b7355" stroke-width="1" opacity="0.2" />
    <polygon points="0,-16 -3.5,-6 0,-9 3.5,-6" fill="#8b0000" opacity="0.6" />
    <text x="-4" y="-30" font-size="10" font-family="serif" fill="#5c3d2e">N</text>
  </g>
</svg>`

const outPath = path.join(__dirname, 'public', 'map_bg.svg')
fs.writeFileSync(outPath, svgContent)
console.log(`✅ 已生成静态底图: ${outPath} (${(svgContent.length / 1024).toFixed(0)} KB)`)
