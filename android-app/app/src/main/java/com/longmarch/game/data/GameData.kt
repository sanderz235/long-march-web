package com.longmarch.game.data

data class LevelInfo(
    val id: Int,
    val mapLabel: String,
    val shortDesc: String,
    val x: Float,
    val y: Float,
)

enum class LevelStatus { LOCKED, AVAILABLE, COMPLETED }

object GameData {
    const val CanvasWidth = 802f
    const val CanvasHeight = 433f

    // 与前端 mapData.ts / Windows 版本保持一致（802x433 逻辑画布坐标）
    val levels: List<LevelInfo> = listOf(
        LevelInfo(1, "瑞金", "伟大征程开始", 649f, 299f),
        LevelInfo(2, "湘江", "惨烈突围之战", 511f, 297f),
        LevelInfo(3, "遵义", "生死攸关转折", 403f, 271f),
        LevelInfo(4, "赤水", "用兵如神", 360f, 245f),
        LevelInfo(5, "金沙江", "跳出包围圈", 277f, 290f),
        LevelInfo(6, "泸定桥", "二十二勇士", 256f, 227f),
        LevelInfo(7, "雪山", "翻越夹金山", 285f, 211f),
        LevelInfo(8, "草地", "松潘大草地", 293f, 175f),
        LevelInfo(9, "腊子口", "攻克天险", 327f, 146f),
        LevelInfo(10, "吴起镇", "长征胜利！", 434f, 104f),
    )
}
