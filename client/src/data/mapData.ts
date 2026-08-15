import { CANVAS_WIDTH, CANVAS_HEIGHT } from './chinaGeoData'

export { CANVAS_WIDTH, CANVAS_HEIGHT }

// ======== 关卡位置计算说明 ========
// 投影公式（与 process_geojson.mjs 一致）：
//   PAD=15, LNGRANGE=28(93~121), LATRANGE=23(19~42)
//   x = 15 + (lng-93)/28 * 772
//   y = 15 + (42-lat)/23 * 403
//
// 部分相邻节点地理距离很近（如泸定桥↔雪山仅 23px），
// 为防节点圆圈重叠，做了小幅偏移调整。
// 约束：真实地理坐标必须落在节点主圆（r=14）范围内。

export interface StationCoord {
  id: number;
  x: number;
  y: number;
  /** 真实地理投影坐标（未经调整） */
  realX: number;
  realY: number;
}

export const STATION_COORDS: StationCoord[] = [
  // id, 真实(lng, lat), 调整后中心, 偏移量
  { id: 1,  realX: 649, realY: 299, x: 649, y: 299 },   // 瑞金 (116.0, 25.8)
  { id: 2,  realX: 511, realY: 297, x: 511, y: 297 },   // 湘江 (111.0, 25.9)
  { id: 3,  realX: 398, realY: 266, x: 403, y: 271 },   // 遵义 (106.9, 27.7) → SE+5
  { id: 4,  realX: 365, realY: 250, x: 360, y: 245 },   // 赤水 (105.7, 28.6) → NW-5
  { id: 5,  realX: 277, realY: 290, x: 277, y: 290 },   // 金沙江 (102.5, 26.3)
  { id: 6,  realX: 269, realY: 227, x: 256, y: 227 },   // 泸定桥 (102.2, 29.9) → W-13
  { id: 7,  realX: 285, realY: 211, x: 285, y: 211 },   // 雪山 (102.8, 30.8)
  { id: 8,  realX: 299, realY: 169, x: 293, y: 175 },   // 草地 (103.3, 33.2) → SW-6,+6
  { id: 9,  realX: 318, realY: 155, x: 327, y: 146 },   // 腊子口 (104.0, 34.0) → NE+9,-9
  { id: 10, realX: 434, realY: 104, x: 434, y: 104 },   // 吴起镇 (108.2, 36.9)
];
