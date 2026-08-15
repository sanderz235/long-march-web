using SkiaSharp;
using LongMarchWindows.Data;
using LongMarchWindows.Models;
using LongMarchWindows.ViewModels;

namespace LongMarchWindows.Rendering;

public static class MapRenderer
{
    private const float NodeR = 14f;
    private const float Margin = 18f;

    // 标签偏移配置（与前端 LevelNode 一致）
    private static readonly Dictionary<int, (string Side, float Gap, float VOffset)> LabelConfig = new()
    {
        [1]  = ("right", 38, -20),
        [2]  = ("right", 38, 20),
        [3]  = ("right", 40, -32),
        [4]  = ("right", 40, -20),
        [5]  = ("left", 44, 20),
        [6]  = ("left", 46, 20),
        [7]  = ("left", 44, -20),
        [8]  = ("left", 44, -30),
        [9]  = ("left", 44, -35),
        [10] = ("right", 46, -20),
    };

    public static void Draw(SKCanvas canvas, GameViewModel vm)
    {
        DrawRoute(canvas, vm.WalkedUpTo);

        foreach (var level in GameData.Levels)
        {
            var status = vm.GetStatus(level.Id);
            DrawNode(canvas, level, status, vm.GetStars(level.Id), vm.SelectedLevelId == level.Id);
        }

        foreach (var level in GameData.Levels)
        {
            DrawNodeLabel(canvas, level);
        }

        DrawSoldier(canvas, vm.PlayerX, vm.PlayerY, vm.IsWalking, vm.WalkPhase);
        DrawTopDecorations(canvas, vm.ProgressText, vm.CurrentLevel);
    }

    // ==================================================================
    // 路线
    // ==================================================================

    private static void DrawRoute(SKCanvas canvas, int walkedUpTo)
    {
        var points = GameData.Levels.Select(l => new SKPoint(l.X, l.Y)).ToArray();

        using (var path = new SKPath())
        {
            path.MoveTo(points[0]);
            for (int i = 1; i < points.Length; i++) path.LineTo(points[i]);

            using var full = new SKPaint
            {
                Color = WithAlpha("#8b7b6b", 0.30f),
                StrokeWidth = 3.5f,
                IsAntialias = true,
                Style = SKPaintStyle.Stroke,
                StrokeCap = SKStrokeCap.Round,
                StrokeJoin = SKStrokeJoin.Round,
            };
            canvas.DrawPath(path, full);
        }

        for (int i = 0; i < points.Length - 1; i++)
        {
            var to = GameData.Levels[i + 1];
            if (to.Id > walkedUpTo) continue;

            using var red = new SKPaint
            {
                Color = WithAlpha("#c41e3a", 0.55f),
                StrokeWidth = 2.5f,
                IsAntialias = true,
                Style = SKPaintStyle.Stroke,
                StrokeCap = SKStrokeCap.Round,
            };
            canvas.DrawLine(points[i], points[i + 1], red);

            using var dash = new SKPaint
            {
                Color = WithAlpha("#c41e3a", 0.30f),
                StrokeWidth = 1.5f,
                IsAntialias = true,
                Style = SKPaintStyle.Stroke,
                StrokeCap = SKStrokeCap.Round,
                PathEffect = SKPathEffect.CreateDash(new float[] { 5, 10 }, 0),
            };
            canvas.DrawLine(points[i], points[i + 1], dash);
        }
    }

    // ==================================================================
    // 站点节点
    // ==================================================================

    private static void DrawNode(SKCanvas canvas, LevelInfo level, LevelStatus status, int stars, bool selected)
    {
        float x = level.X, y = level.Y, r = NodeR;

        string fill, stroke, highlight, number;
        switch (status)
        {
            case LevelStatus.Locked:
                fill = "#7d7d7d"; stroke = "#4a4a4a"; highlight = "#9e9e9e"; number = "#b0b0b0";
                break;
            case LevelStatus.Completed:
                fill = "#2e7d32"; stroke = "#1b5e20"; highlight = "#4caf50"; number = "#ffffff";
                break;
            default:
                fill = "#f9a825"; stroke = "#e65100"; highlight = "#ffcc02"; number = "#ffffff";
                break;
        }

        // 阴影
        canvas.DrawCircle(x + 3, y + 3, r, Fill(WithAlpha("#000000", 0.35f)));

        // 主圆
        canvas.DrawCircle(x, y, r, Fill(SKColor.Parse(fill)));
        canvas.DrawCircle(x, y, r, Stroke(SKColor.Parse(stroke), 2.5f));

        // 内圈高光
        canvas.DrawCircle(x, y - r * 0.15f, r * 0.58f, Fill(WithAlpha(highlight, 0.28f)));

        // 关卡编号
        DrawCenteredText(canvas, level.Id.ToString(), x, y, 12f, SKColor.Parse(number), Sans(true));

        if (status == LevelStatus.Locked)
            DrawLock(canvas, x, y);

        if (status == LevelStatus.Completed)
            DrawStars(canvas, x, y + r + 4, stars);

        if (selected && status != LevelStatus.Locked)
            DrawSelectedCard(canvas, level);
    }

    private static void DrawLock(SKCanvas canvas, float x, float y)
    {
        canvas.Save();
        canvas.Translate(x, y - 0.5f);

        // 锁梁
        using (var shackle = new SKPath())
        {
            shackle.MoveTo(-4.5f, 0);
            shackle.LineTo(-4.5f, -5.5f);
            shackle.LineTo(4.5f, -5.5f);
            shackle.LineTo(4.5f, 0);
            canvas.DrawPath(shackle, Stroke(SKColor.Parse("#d5d5d5"), 2.8f));
        }

        // 锁体
        canvas.DrawRoundRect(new SKRect(-6, 0.5f, 6, 8.5f), 2, 2, Fill(SKColor.Parse("#e8e8e8")));
        canvas.DrawRoundRect(new SKRect(-6, 0.5f, 6, 8.5f), 2, 2, Stroke(SKColor.Parse("#aaaaaa"), 1.2f));

        // 锁体高光
        canvas.DrawRoundRect(new SKRect(-3.5f, 1.5f, 0, 5), 1, 1, Fill(WithAlpha("#ffffff", 0.35f)));

        // 钥匙孔
        canvas.DrawCircle(0, 4, 1.2f, Fill(SKColor.Parse("#424242")));
        canvas.DrawRoundRect(new SKRect(-0.5f, 4, 0.5f, 6.5f), 0.5f, 0.5f, Fill(SKColor.Parse("#424242")));

        canvas.Restore();
    }

    private static void DrawStars(SKCanvas canvas, float x, float y, int stars)
    {
        for (int i = 0; i < 3; i++)
        {
            float sx = x - 18 + i * 18;
            string ch = i < stars ? "★" : "☆";
            var color = i < stars ? SKColor.Parse("#ffd700") : SKColor.Parse("#558b2f");
            DrawCenteredText(canvas, ch, sx, y, 14f, color, Serif(false));
        }
    }

    private static void DrawSelectedCard(SKCanvas canvas, LevelInfo level)
    {
        float x = Clamp(level.X - 120, 8, GameData.CanvasWidth - 240 - 8);
        float y = Clamp(level.Y + NodeR + 28, 8, GameData.CanvasHeight - 60);

        var rect = new SKRect(x, y, x + 240, y + 56);
        canvas.DrawRoundRect(rect, 8, 8, Fill(WithAlpha("#120804", 0.95f)));
        canvas.DrawRoundRect(rect, 8, 8, Stroke(WithAlpha("#f0d68a", 0.4f), 1.2f));

        DrawText(canvas, level.MapLabel, x + 12, y + 16, 13f, SKColor.Parse("#f0d68a"), Serif(true));
        DrawText(canvas, level.ShortDesc, x + 12, y + 38, 10f, SKColor.Parse("#d4b896"), Serif(false));
    }

    // ==================================================================
    // 节点标签
    // ==================================================================

    private static void DrawNodeLabel(SKCanvas canvas, LevelInfo level)
    {
        (string Side, float Gap, float VOffset) cfg = ("right", 44f, -16f);
        if (LabelConfig.TryGetValue(level.Id, out var c)) cfg = c;

        bool isRight = cfg.Side == "right";
        float dir = isRight ? 1f : -1f;

        float armEndX = level.X + dir * (NodeR + cfg.Gap);
        float labelY = level.Y + cfg.VOffset;
        float armStartY = labelY < level.Y ? level.Y - NodeR : level.Y + NodeR;

        const float padX = 7, padY = 3, fontSize = 11;
        float estW = level.MapLabel.Length * fontSize + padX * 2;
        float estH = fontSize + padY * 2;
        float boxX = isRight ? armEndX + 4 : armEndX - 4 - estW;
        float boxY = labelY - estH / 2;

        var lineColor = WithAlpha("#8b7355", 0.45f);

        canvas.DrawLine(new SKPoint(level.X, armStartY), new SKPoint(level.X, labelY), Stroke(lineColor, 1f));
        canvas.DrawLine(new SKPoint(level.X, labelY), new SKPoint(armEndX, labelY), Stroke(lineColor, 1f));

        var box = new SKRect(boxX, boxY, boxX + estW, boxY + estH);
        canvas.DrawRoundRect(box, 4, 4, Fill(WithAlpha("#140a05", 0.9f)));
        canvas.DrawRoundRect(box, 4, 4, Stroke(WithAlpha("#a07850", 0.32f), 0.8f));

        DrawCenteredText(canvas, level.MapLabel, boxX + estW / 2, boxY + estH / 2, fontSize, SKColor.Parse("#d4b896"), Serif(true));
    }

    // ==================================================================
    // 红军小人
    // ==================================================================

    private static void DrawSoldier(SKCanvas canvas, float x, float y, bool walking, float phase)
    {
        float bodyBounce = walking ? (float)(Math.Sin(phase * Math.PI * 2) * 2.5) : 0f;
        float leftLegAngle = walking ? (float)(Math.Sin(phase * Math.PI * 2) * 15) : 0f;
        float rightLegAngle = walking ? (float)(Math.Sin(phase * Math.PI * 2 + Math.PI) * 15) : 0f;
        float leftArmAngle = walking ? (float)(Math.Sin(phase * Math.PI * 2 + Math.PI) * 10) : 0f;
        float rightArmAngle = walking ? (float)(Math.Sin(phase * Math.PI * 2) * 10) : 0f;

        canvas.Save();
        canvas.Translate(x, y + bodyBounce);

        // 底部阴影
        canvas.DrawCircle(0, 18, 6, Fill(WithAlpha("#000000", 0.15f)));

        // 左腿
        canvas.Save();
        canvas.Translate(-3, 4);
        canvas.RotateDegrees(leftLegAngle);
        canvas.DrawRoundRect(new SKRect(0, 0, 4.5f, 9), 1.5f, 1.5f, Fill(SKColor.Parse("#3b4a52")));
        canvas.DrawRoundRect(new SKRect(0, 5, 4.5f, 8), 0.5f, 0.5f, Fill(SKColor.Parse("#8b6914")));
        canvas.DrawRoundRect(new SKRect(-0.5f, 9, 5, 11.5f), 1, 1, Fill(SKColor.Parse("#8b7355")));
        canvas.Restore();

        // 右腿
        canvas.Save();
        canvas.Translate(3, 4);
        canvas.RotateDegrees(rightLegAngle);
        canvas.DrawRoundRect(new SKRect(-4.5f, 0, 0, 9), 1.5f, 1.5f, Fill(SKColor.Parse("#3b4a52")));
        canvas.DrawRoundRect(new SKRect(-4.5f, 5, 0, 8), 0.5f, 0.5f, Fill(SKColor.Parse("#8b6914")));
        canvas.DrawRoundRect(new SKRect(-5, 9, 0.5f, 11.5f), 1, 1, Fill(SKColor.Parse("#8b7355")));
        canvas.Restore();

        // 身体（灰蓝军装）
        canvas.Save();
        canvas.Translate(0, -8);
        canvas.DrawRoundRect(new SKRect(-6.5f, 0, 6.5f, 14), 2, 2, Fill(SKColor.Parse("#5c6b73")));
        canvas.DrawRoundRect(new SKRect(-6.5f, 9, 6.5f, 11.5f), 0.5f, 0.5f, Fill(SKColor.Parse("#8b6914")));

        using (var collar = new SKPath())
        {
            collar.MoveTo(-3, 0);
            collar.LineTo(0, 3.5f);
            collar.LineTo(3, 0);
            collar.Close();
            canvas.DrawPath(collar, Fill(WithAlpha("#000000", 0.1f)));
            canvas.DrawPath(collar, Stroke(SKColor.Parse("#4a555c"), 1.5f));
        }

        canvas.DrawCircle(0, 5, 1, Fill(SKColor.Parse("#6b5545")));
        canvas.DrawCircle(0, 7.5f, 1, Fill(SKColor.Parse("#6b5545")));
        canvas.Restore();

        // 左臂
        canvas.Save();
        canvas.Translate(-7.5f, -5.5f);
        canvas.RotateDegrees(leftArmAngle);
        canvas.DrawRoundRect(new SKRect(0, 0, 3.5f, 9), 1.5f, 1.5f, Fill(SKColor.Parse("#5c6b73")));
        canvas.DrawCircle(1.75f, 10, 2, Fill(SKColor.Parse("#e8c99b")));
        canvas.Restore();

        // 右臂
        canvas.Save();
        canvas.Translate(7.5f, -5.5f);
        canvas.RotateDegrees(rightArmAngle);
        canvas.DrawRoundRect(new SKRect(-3.5f, 0, 0, 9), 1.5f, 1.5f, Fill(SKColor.Parse("#5c6b73")));
        canvas.DrawCircle(-1.75f, 10, 2, Fill(SKColor.Parse("#e8c99b")));
        canvas.Restore();

        // 头部（脸部下缘贴合身体顶部，避免头颈分离）
        canvas.Save();
        canvas.Translate(0, -14.5f);
        canvas.DrawCircle(0, 0, 6.5f, Fill(SKColor.Parse("#e8c99b")));
        canvas.DrawCircle(-2.5f, -1, 0.9f, Fill(SKColor.Parse("#2c1810")));
        canvas.DrawCircle(2.5f, -1, 0.9f, Fill(SKColor.Parse("#2c1810")));
        canvas.DrawLine(new SKPoint(-4, -2.8f), new SKPoint(-1.2f, -2.8f), Stroke(SKColor.Parse("#5a3a28"), 0.7f));
        canvas.DrawLine(new SKPoint(1.2f, -2.8f), new SKPoint(4, -2.8f), Stroke(SKColor.Parse("#5a3a28"), 0.7f));

        using (var nose = new SKPath())
        {
            nose.MoveTo(0, -0.5f);
            nose.LineTo(-0.6f, 1);
            nose.LineTo(0.6f, 1);
            canvas.DrawPath(nose, Stroke(SKColor.Parse("#d4a87c"), 0.6f));
        }

        using (var mouth = new SKPath())
        {
            mouth.MoveTo(-1.5f, 2.5f);
            mouth.LineTo(0, 3.3f);
            mouth.LineTo(1.5f, 2.5f);
            canvas.DrawPath(mouth, Stroke(SKColor.Parse("#c47a5a"), 0.7f));
        }
        canvas.Restore();

        // 八角帽（随头部同步上移）
        canvas.Save();
        canvas.Translate(0, -22f);
        canvas.DrawRoundRect(new SKRect(-7.5f, 0, 7.5f, 5.5f), 1.5f, 1.5f, Fill(SKColor.Parse("#7a6350")));
        canvas.DrawRoundRect(new SKRect(-8, -2.5f, 8, 1.5f), 2, 2, Fill(SKColor.Parse("#5a4638")));
        canvas.DrawRoundRect(new SKRect(-10, 3, 10, 6), 1, 1, Fill(SKColor.Parse("#3b2a1a")));

        using (var star = new SKPath())
        {
            star.MoveTo(0, -3);
            star.LineTo(1, -1.25f);
            star.LineTo(2.75f, -1);
            star.LineTo(1.5f, -0.1f);
            star.LineTo(2, 1.5f);
            star.LineTo(0, 0.5f);
            star.LineTo(-2, 1.5f);
            star.LineTo(-1.5f, -0.1f);
            star.LineTo(-2.75f, -1);
            star.LineTo(-1, -1.25f);
            star.Close();
            canvas.DrawPath(star, Fill(SKColor.Parse("#c41e3a")));
        }
        canvas.Restore();

        // 步枪
        canvas.Save();
        canvas.Translate(0, -10);
        canvas.DrawLine(new SKPoint(-6, 12), new SKPoint(6, -6), Stroke(SKColor.Parse("#4a3520"), 2f));
        canvas.DrawRoundRect(new SKRect(-6, 11.5f, -3, 15.5f), 0.5f, 0.5f, Fill(SKColor.Parse("#3b2a1a")));
        canvas.DrawRoundRect(new SKRect(4, -7, 6.5f, -4), 0.5f, 0.5f, Fill(SKColor.Parse("#4a3520")));
        canvas.Restore();

        canvas.Restore();
    }

    // ==================================================================
    // 顶部装饰
    // ==================================================================

    private static void DrawTopDecorations(SKCanvas canvas, string progressText, int currentLevel)
    {
        float W = GameData.CanvasWidth;
        float H = GameData.CanvasHeight;

        // 四角装饰
        DrawCorner(canvas, Margin + 8, Margin + 8, 0);
        DrawCorner(canvas, W - Margin - 8, Margin + 8, 90);
        DrawCorner(canvas, W - Margin - 8, H - Margin - 8, 180);
        DrawCorner(canvas, Margin + 8, H - Margin - 8, 270);

        // 标题
        canvas.DrawRoundRect(new SKRect(Margin + 12, Margin + 8, Margin + 12 + 140, Margin + 8 + 34), 4, 4, Fill(WithAlpha("#f4e4c1", 0.18f)));
        canvas.DrawRoundRect(new SKRect(Margin + 12, Margin + 8, Margin + 12 + 140, Margin + 8 + 34), 4, 4, Stroke(WithAlpha("#a08060", 0.3f), 1f));
        DrawText(canvas, "长征路线图", Margin + 22, Margin + 20, 16f, SKColor.Parse("#3b2a1a"), Serif(true));
        DrawText(canvas, "1934 — 1936", Margin + 22, Margin + 36, 9f, SKColor.Parse("#8b7355"), Serif(false));

        // 底部进度条
        canvas.DrawRoundRect(new SKRect(Margin + 6, H - 46, W - (Margin + 6), H - 18), 4, 4, Fill(WithAlpha("#1c0e08", 0.75f)));
        DrawText(canvas, progressText, Margin + 16, H - 31, 12f, SKColor.Parse("#d4b896"), Serif(false));
    }

    private static void DrawCorner(SKCanvas canvas, float x, float y, float rotation)
    {
        canvas.Save();
        canvas.Translate(x, y);
        canvas.RotateDegrees(rotation);

        using var path = new SKPath();
        path.MoveTo(0, 0);
        path.LineTo(36, 0);
        path.LineTo(36, 3);
        path.LineTo(3, 3);
        path.LineTo(3, 36);
        path.LineTo(0, 36);
        path.Close();

        canvas.DrawPath(path, Fill(WithAlpha("#b8860b", 0.3f)));
        canvas.DrawPath(path, Stroke(SKColor.Parse("#8b6914"), 0.5f));

        canvas.Restore();
    }

    // ==================================================================
    // 文本 / 画笔辅助
    // ==================================================================

    private static void DrawText(SKCanvas canvas, string text, float x, float y, float size, SKColor color, SKTypeface? typeface)
    {
        using var paint = new SKPaint
        {
            TextSize = size,
            Color = color,
            IsAntialias = true,
            Typeface = typeface,
        };
        canvas.DrawText(text, x, y, paint);
    }

    private static void DrawCenteredText(SKCanvas canvas, string text, float cx, float cy, float size, SKColor color, SKTypeface? typeface)
    {
        using var paint = new SKPaint
        {
            TextSize = size,
            Color = color,
            IsAntialias = true,
            Typeface = typeface,
            TextAlign = SKTextAlign.Center,
        };
        var metrics = paint.FontMetrics;
        float textY = cy - (metrics.Ascent + metrics.Descent) / 2;
        canvas.DrawText(text, cx, textY, paint);
    }

    private static SKPaint Fill(SKColor color) =>
        new() { Color = color, IsAntialias = true, Style = SKPaintStyle.Fill };

    private static SKPaint Stroke(SKColor color, float width) =>
        new()
        {
            Color = color,
            IsAntialias = true,
            Style = SKPaintStyle.Stroke,
            StrokeWidth = width,
            StrokeCap = SKStrokeCap.Round,
            StrokeJoin = SKStrokeJoin.Round,
        };

    private static SKColor WithAlpha(string hex, float alpha)
    {
        var color = SKColor.Parse(hex);
        return color.WithAlpha((byte)Math.Clamp((int)(alpha * 255), 0, 255));
    }

    private static SKTypeface? Serif(bool bold) =>
        SKTypeface.FromFamilyName("Times New Roman",
            bold ? SKFontStyleWeight.Bold : SKFontStyleWeight.Normal,
            SKFontStyleWidth.Normal,
            SKFontStyleSlant.Upright);

    private static SKTypeface? Sans(bool bold) =>
        SKTypeface.FromFamilyName("Arial",
            bold ? SKFontStyleWeight.Bold : SKFontStyleWeight.Normal,
            SKFontStyleWidth.Normal,
            SKFontStyleSlant.Upright);

    private static float Clamp(float v, float lo, float hi) => Math.Max(lo, Math.Min(v, hi));
}
