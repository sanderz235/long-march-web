import fs from 'fs'

const geojson = JSON.parse(fs.readFileSync('src/data/china_full.geojson', 'utf-8'))

// 长征路线涉及的 8 个省份
const TARGET_PROVINCES = [
  '江西省', '湖南省', '广西壮族自治区', '贵州省',
  '云南省', '四川省', '甘肃省', '陕西省',
]

// Canvas 尺寸
const W = 802
const H = 433

// 投影范围：对齐现有关卡坐标
// 瑞金(~116, 25.8) → (650, 300), 吴起镇(~108.2, 36.9) → (430, 110)
const LNG_MIN = 93
const LNG_MAX = 121
const LAT_MIN = 19
const LAT_MAX = 42

// 添加 padding
const PAD = 15

function project([lng, lat]) {
  const x = PAD + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (W - 2 * PAD)
  const y = PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (H - 2 * PAD)
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
}

function simplify(coords, keepEvery = 3) {
  if (!Array.isArray(coords[0][0])) {
    return coords.filter((_, i) => i % keepEvery === 0)
  }
  return coords.map(ring => simplify(ring, keepEvery))
}

// 处理所有省份（不只是8个目标省份）
const allProvinces = []

for (const feat of geojson.features) {
  const name = feat.properties.name
  // 跳过子级（只处理省级）
  if (feat.properties.level !== 'province') continue
  
  const geom = feat.geometry
  let coordsList = []
  if (geom.type === 'Polygon') {
    coordsList = [geom.coordinates]
  } else if (geom.type === 'MultiPolygon') {
    coordsList = geom.coordinates
  }

  const polygons = []
  for (const poly of coordsList) {
    // 不抽样（keepEvery=1）：保留源数据全部顶点。
    // 源 geojson 中相邻省份共享边界坐标完全一致，投影取整后仍逐点重合；
    // 之前 keepEvery=4 的独立抽样把共享顶点拆散，导致交界处出现空隙。
    const outerRing = simplify(poly[0], 1).map(project)
    const holes = poly.slice(1).map(hole => simplify(hole, 1).map(project))
    polygons.push({ outer: outerRing, holes })
  }

  allProvinces.push({
    name,
    adcode: feat.properties.adcode,
    polygons,
    isTarget: TARGET_PROVINCES.includes(name),
  })
}

console.log(`处理了 ${allProvinces.length} 个省份，其中 ${allProvinces.filter(p => p.isTarget).length} 个目标省份`)

// 生成 TypeScript 文件前，先检查文件大小
const lines = []
lines.push('// 自动生成的中国省份地图数据')
lines.push('// 由 process_geojson.mjs 从 DataV GeoJSON 生成')
lines.push('// 保留全部顶点（不抽样）：相邻省份共享边界在源数据中坐标完全一致，投影取整后仍逐点重合，杜绝交界处空隙/双线')
lines.push('')
lines.push(`export const CANVAS_WIDTH = ${W};`)
lines.push(`export const CANVAS_HEIGHT = ${H};`)
lines.push('')
lines.push('export interface PolygonRing {')
lines.push('  outer: [number, number][];')
lines.push('  holes: [number, number][][];')
lines.push('}')
lines.push('')
lines.push('export interface ProvincePath {')
lines.push('  name: string;')
lines.push('  adcode: number;')
lines.push('  polygons: PolygonRing[];')
lines.push('  isTarget: boolean;')
lines.push('}')
lines.push('')
lines.push('export function provinceToPathData(polygon: PolygonRing): string {')
lines.push('  const parts: string[] = [];')
lines.push('  for (const ring of [polygon.outer, ...polygon.holes]) {')
lines.push('    if (ring.length === 0) continue;')
lines.push('    parts.push("M " + ring[0][0] + " " + ring[0][1] + " " + ring.slice(1).map(p => "L " + p[0] + " " + p[1]).join(" ") + " Z");')
lines.push('  }')
lines.push('  return parts.join(" ");')
lines.push('}')
lines.push('')

lines.push('export const PROVINCE_DATA: ProvincePath[] = [')

for (const p of allProvinces) {
  lines.push('  {')
  lines.push(`    name: "${p.name}",`)
  lines.push(`    adcode: ${p.adcode},`)
  lines.push(`    isTarget: ${p.isTarget},`)
  lines.push('    polygons: [')
  for (const poly of p.polygons) {
    lines.push('      {')
    lines.push(`        outer: ${JSON.stringify(poly.outer)},`)
    lines.push(`        holes: ${JSON.stringify(poly.holes)},`)
    lines.push('      },')
  }
  lines.push('    ],')
  lines.push('  },')
}

lines.push('];')
lines.push('')
lines.push('// 长征路线涉及的省份名称列表')
lines.push(`export const LONG_MARCH_PROVINCES = ${JSON.stringify(TARGET_PROVINCES)};`)

fs.writeFileSync('src/data/chinaGeoData.ts', lines.join('\n'))
console.log('已生成 chinaGeoData.ts')
