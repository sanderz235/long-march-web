using LongMarchWindows.Models;

namespace LongMarchWindows.Data;

public static class GameData
{
    public const float CanvasWidth = 802f;
    public const float CanvasHeight = 433f;

    // 与前端 mapData.ts 保持一致（802x433 逻辑画布坐标）
    public static readonly IReadOnlyList<LevelInfo> Levels = new List<LevelInfo>
    {
        new() { Id = 1,  MapLabel = "瑞金",   ShortDesc = "伟大征程开始", X = 649, Y = 299 },
        new() { Id = 2,  MapLabel = "湘江",   ShortDesc = "惨烈突围之战", X = 511, Y = 297 },
        new() { Id = 3,  MapLabel = "遵义",   ShortDesc = "生死攸关转折", X = 403, Y = 271 },
        new() { Id = 4,  MapLabel = "赤水",   ShortDesc = "用兵如神",     X = 360, Y = 245 },
        new() { Id = 5,  MapLabel = "金沙江", ShortDesc = "跳出包围圈",   X = 277, Y = 290 },
        new() { Id = 6,  MapLabel = "泸定桥", ShortDesc = "二十二勇士",   X = 256, Y = 227 },
        new() { Id = 7,  MapLabel = "雪山",   ShortDesc = "翻越夹金山",   X = 285, Y = 211 },
        new() { Id = 8,  MapLabel = "草地",   ShortDesc = "松潘大草地",   X = 293, Y = 175 },
        new() { Id = 9,  MapLabel = "腊子口", ShortDesc = "攻克天险",     X = 327, Y = 146 },
        new() { Id = 10, MapLabel = "吴起镇", ShortDesc = "长征胜利！",   X = 434, Y = 104 },
    };
}
