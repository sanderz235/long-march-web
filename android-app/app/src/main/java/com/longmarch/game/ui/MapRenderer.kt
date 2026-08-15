package com.longmarch.game.ui

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.longmarch.game.data.GameData
import com.longmarch.game.data.LevelInfo
import com.longmarch.game.data.LevelStatus
import kotlin.math.PI
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

// 逻辑画布自绘（与 Windows 版 MapRenderer 完全一致）
fun DrawScope.drawMap(state: GameUiState, textMeasurer: TextMeasurer) {
    drawRoute(state.walkedUpTo)

    GameData.levels.forEach { level ->
        drawNode(
            level = level,
            status = state.status(level.id),
            stars = state.stars(level.id),
            selected = state.selectedLevelId == level.id,
            textMeasurer = textMeasurer,
        )
    }

    GameData.levels.forEach { level -> drawNodeLabel(level, textMeasurer) }

    drawSoldier(state.playerX, state.playerY, state.isWalking, state.walkPhase)
    drawTopDecorations(state.progressText, textMeasurer)
}

// ====================================================================
// 颜色 / 文本辅助
// ====================================================================

private fun hex(hex: String): Color =
    Color(android.graphics.Color.parseColor(hex).toLong() and 0xFFFFFFFFL)

private fun hexAlpha(hex: String, alpha: Float): Color = hex(hex).copy(alpha = alpha)

private fun DrawScope.drawText(
    text: String,
    x: Float,
    y: Float,
    size: Float,
    color: Color,
    fontFamily: FontFamily,
    fontWeight: FontWeight,
    textMeasurer: TextMeasurer,
) {
    val layout = textMeasurer.measure(
        text = AnnotatedString(text),
        style = TextStyle(
            color = color,
            fontSize = size.sp,
            fontFamily = fontFamily,
            fontWeight = fontWeight,
        ),
    )
    drawText(layout, topLeft = Offset(x, y))
}

private fun DrawScope.drawCenteredText(
    text: String,
    cx: Float,
    cy: Float,
    size: Float,
    color: Color,
    fontFamily: FontFamily,
    fontWeight: FontWeight,
    textMeasurer: TextMeasurer,
) {
    val layout = textMeasurer.measure(
        text = AnnotatedString(text),
        style = TextStyle(
            color = color,
            fontSize = size.sp,
            fontFamily = fontFamily,
            fontWeight = fontWeight,
        ),
    )
    drawText(
        layout,
        topLeft = Offset(cx - layout.size.width / 2f, cy - layout.size.height / 2f),
    )
}

// ====================================================================
// 路线
// ====================================================================

private fun DrawScope.drawRoute(walkedUpTo: Int) {
    val points = GameData.levels.map { Offset(it.x, it.y) }

    val full = Path().apply {
        moveTo(points[0].x, points[0].y)
        for (i in 1 until points.size) lineTo(points[i].x, points[i].y)
    }
    drawPath(
        path = full,
        color = hexAlpha("#8b7b6b", 0.30f),
        style = Stroke(width = 3.5f, cap = StrokeCap.Round, join = StrokeJoin.Round),
    )

    for (i in 0 until points.size - 1) {
        val to = GameData.levels[i + 1]
        if (to.id > walkedUpTo) continue

        drawLine(
            color = hexAlpha("#c41e3a", 0.55f),
            start = points[i],
            end = points[i + 1],
            strokeWidth = 2.5f,
            cap = StrokeCap.Round,
        )
        drawLine(
            color = hexAlpha("#c41e3a", 0.30f),
            start = points[i],
            end = points[i + 1],
            strokeWidth = 1.5f,
            cap = StrokeCap.Round,
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(5f, 10f), 0f),
        )
    }
}

// ====================================================================
// 站点节点
// ====================================================================

private const val NodeR = 14f

private fun DrawScope.drawNode(
    level: LevelInfo,
    status: LevelStatus,
    stars: Int,
    selected: Boolean,
    textMeasurer: TextMeasurer,
) {
    val x = level.x
    val y = level.y
    val r = NodeR

    val (fill, stroke, highlight, number) = when (status) {
        LevelStatus.LOCKED -> listOf("#7d7d7d", "#4a4a4a", "#9e9e9e", "#b0b0b0")
        LevelStatus.COMPLETED -> listOf("#2e7d32", "#1b5e20", "#4caf50", "#ffffff")
        LevelStatus.AVAILABLE -> listOf("#f9a825", "#e65100", "#ffcc02", "#ffffff")
    }

    drawCircle(hexAlpha("#000000", 0.35f), r, Offset(x + 3, y + 3))
    drawCircle(hex(fill), r, Offset(x, y))
    drawCircle(hex(stroke), r, Offset(x, y), style = Stroke(width = 2.5f))
    drawCircle(hexAlpha(highlight, 0.28f), r * 0.58f, Offset(x, y - r * 0.15f))

    drawCenteredText(level.id.toString(), x, y, 12f, hex(number), FontFamily.SansSerif, FontWeight.Bold, textMeasurer)

    if (status == LevelStatus.LOCKED) drawLock(x, y)
    if (status == LevelStatus.COMPLETED) drawStars(x, y + r + 4, stars, textMeasurer)
    if (selected && status != LevelStatus.LOCKED) drawSelectedCard(level, textMeasurer)
}

private fun DrawScope.drawLock(x: Float, y: Float) {
    translate(x, y - 0.5f) {
        val shackle = Path().apply {
            moveTo(-4.5f, 0f)
            lineTo(-4.5f, -5.5f)
            lineTo(4.5f, -5.5f)
            lineTo(4.5f, 0f)
        }
        drawPath(shackle, hex("#d5d5d5"), style = Stroke(width = 2.8f))

        drawRoundRect(hex("#e8e8e8"), Offset(-6f, 0.5f), Size(12f, 8f), CornerRadius(2f, 2f))
        drawRoundRect(
            hex("#aaaaaa"),
            Offset(-6f, 0.5f),
            Size(12f, 8f),
            CornerRadius(2f, 2f),
            style = Stroke(width = 1.2f),
        )
        drawRoundRect(hexAlpha("#ffffff", 0.35f), Offset(-3.5f, 1.5f), Size(3.5f, 3.5f), CornerRadius(1f, 1f))
        drawCircle(hex("#424242"), 1.2f, Offset(0f, 4f))
        drawRoundRect(hex("#424242"), Offset(-0.5f, 4f), Size(1f, 2.5f), CornerRadius(0.5f, 0.5f))
    }
}

private fun DrawScope.drawStars(x: Float, y: Float, stars: Int, textMeasurer: TextMeasurer) {
    for (i in 0 until 3) {
        val sx = x - 18 + i * 18
        val ch = if (i < stars) "★" else "☆"
        val color = if (i < stars) hex("#ffd700") else hex("#558b2f")
        drawCenteredText(ch, sx, y, 14f, color, FontFamily.Serif, FontWeight.Normal, textMeasurer)
    }
}

private fun DrawScope.drawSelectedCard(level: LevelInfo, textMeasurer: TextMeasurer) {
    val x = clamp(level.x - 120, 8f, GameData.CanvasWidth - 240f - 8f)
    val y = clamp(level.y + NodeR + 28, 8f, GameData.CanvasHeight - 60f)

    drawRoundRect(hexAlpha("#120804", 0.95f), Offset(x, y), Size(240f, 56f), CornerRadius(8f, 8f))
    drawRoundRect(
        hexAlpha("#f0d68a", 0.4f),
        Offset(x, y),
        Size(240f, 56f),
        CornerRadius(8f, 8f),
        style = Stroke(width = 1.2f),
    )
    drawText(level.mapLabel, x + 12, y + 16, 13f, hex("#f0d68a"), FontFamily.Serif, FontWeight.Bold, textMeasurer)
    drawText(level.shortDesc, x + 12, y + 38, 10f, hex("#d4b896"), FontFamily.Serif, FontWeight.Normal, textMeasurer)
}

// ====================================================================
// 节点标签
// ====================================================================

private data class LabelCfg(val side: String, val gap: Float, val vOffset: Float)

private val labelConfig = mapOf(
    1 to LabelCfg("right", 38f, -20f),
    2 to LabelCfg("right", 38f, 20f),
    3 to LabelCfg("right", 40f, -32f),
    4 to LabelCfg("right", 40f, -20f),
    5 to LabelCfg("left", 44f, 20f),
    6 to LabelCfg("left", 46f, 20f),
    7 to LabelCfg("left", 44f, -20f),
    8 to LabelCfg("left", 44f, -30f),
    9 to LabelCfg("left", 44f, -35f),
    10 to LabelCfg("right", 46f, -20f),
)

private fun DrawScope.drawNodeLabel(level: LevelInfo, textMeasurer: TextMeasurer) {
    val cfg = labelConfig[level.id] ?: LabelCfg("right", 44f, -16f)
    val isRight = cfg.side == "right"
    val dir = if (isRight) 1f else -1f

    val armEndX = level.x + dir * (NodeR + cfg.gap)
    val labelY = level.y + cfg.vOffset
    val armStartY = if (labelY < level.y) level.y - NodeR else level.y + NodeR

    val padX = 7f
    val padY = 3f
    val fontSize = 11f
    val estW = level.mapLabel.length * fontSize + padX * 2
    val estH = fontSize + padY * 2
    val boxX = if (isRight) armEndX + 4 else armEndX - 4 - estW
    val boxY = labelY - estH / 2

    val lineColor = hexAlpha("#8b7355", 0.45f)
    drawLine(lineColor, Offset(level.x, armStartY), Offset(level.x, labelY), strokeWidth = 1f)
    drawLine(lineColor, Offset(level.x, labelY), Offset(armEndX, labelY), strokeWidth = 1f)

    drawRoundRect(hexAlpha("#140a05", 0.9f), Offset(boxX, boxY), Size(estW, estH), CornerRadius(4f, 4f))
    drawRoundRect(
        hexAlpha("#a07850", 0.32f),
        Offset(boxX, boxY),
        Size(estW, estH),
        CornerRadius(4f, 4f),
        style = Stroke(width = 0.8f),
    )
    drawCenteredText(
        level.mapLabel,
        boxX + estW / 2,
        boxY + estH / 2,
        fontSize,
        hex("#d4b896"),
        FontFamily.Serif,
        FontWeight.Bold,
        textMeasurer,
    )
}

// ====================================================================
// 红军小人
// ====================================================================

private fun DrawScope.drawSoldier(x: Float, y: Float, walking: Boolean, phase: Float) {
    val bodyBounce = if (walking) (sin(phase * PI.toFloat() * 2) * 2.5).toFloat() else 0f
    val leftLegAngle = if (walking) (sin(phase * PI.toFloat() * 2) * 15).toFloat() else 0f
    val rightLegAngle = if (walking) (sin(phase * PI.toFloat() * 2 + PI.toFloat()) * 15).toFloat() else 0f
    val leftArmAngle = if (walking) (sin(phase * PI.toFloat() * 2 + PI.toFloat()) * 10).toFloat() else 0f
    val rightArmAngle = if (walking) (sin(phase * PI.toFloat() * 2) * 10).toFloat() else 0f

    translate(x, y + bodyBounce) {
        drawCircle(hexAlpha("#000000", 0.15f), 6f, Offset(0f, 18f))

        // 左腿
        translate(-3f, 4f) {
            rotate(leftLegAngle, Offset.Zero) {
                drawRoundRect(hex("#3b4a52"), Offset(0f, 0f), Size(4.5f, 9f), CornerRadius(1.5f, 1.5f))
                drawRoundRect(hex("#8b6914"), Offset(0f, 5f), Size(4.5f, 3f), CornerRadius(0.5f, 0.5f))
                drawRoundRect(hex("#8b7355"), Offset(-0.5f, 9f), Size(5.5f, 2.5f), CornerRadius(1f, 1f))
            }
        }

        // 右腿
        translate(3f, 4f) {
            rotate(rightLegAngle, Offset.Zero) {
                drawRoundRect(hex("#3b4a52"), Offset(-4.5f, 0f), Size(4.5f, 9f), CornerRadius(1.5f, 1.5f))
                drawRoundRect(hex("#8b6914"), Offset(-4.5f, 5f), Size(4.5f, 3f), CornerRadius(0.5f, 0.5f))
                drawRoundRect(hex("#8b7355"), Offset(-5f, 9f), Size(5.5f, 2.5f), CornerRadius(1f, 1f))
            }
        }

        // 身体（灰蓝军装）
        translate(0f, -8f) {
            drawRoundRect(hex("#5c6b73"), Offset(-6.5f, 0f), Size(13f, 14f), CornerRadius(2f, 2f))
            drawRoundRect(hex("#8b6914"), Offset(-6.5f, 9f), Size(13f, 2.5f), CornerRadius(0.5f, 0.5f))

            val collar = Path().apply {
                moveTo(-3f, 0f)
                lineTo(0f, 3.5f)
                lineTo(3f, 0f)
                close()
            }
            drawPath(collar, hexAlpha("#000000", 0.1f))
            drawPath(collar, hex("#4a555c"), style = Stroke(width = 1.5f))

            drawCircle(hex("#6b5545"), 1f, Offset(0f, 5f))
            drawCircle(hex("#6b5545"), 1f, Offset(0f, 7.5f))
        }

        // 左臂
        translate(-7.5f, -5.5f) {
            rotate(leftArmAngle, Offset.Zero) {
                drawRoundRect(hex("#5c6b73"), Offset(0f, 0f), Size(3.5f, 9f), CornerRadius(1.5f, 1.5f))
                drawCircle(hex("#e8c99b"), 2f, Offset(1.75f, 10f))
            }
        }

        // 右臂
        translate(7.5f, -5.5f) {
            rotate(rightArmAngle, Offset.Zero) {
                drawRoundRect(hex("#5c6b73"), Offset(-3.5f, 0f), Size(3.5f, 9f), CornerRadius(1.5f, 1.5f))
                drawCircle(hex("#e8c99b"), 2f, Offset(-1.75f, 10f))
            }
        }

        // 头部（脸部下缘贴合身体顶部，避免头颈分离）
        translate(0f, -14.5f) {
            drawCircle(hex("#e8c99b"), 6.5f, Offset(0f, 0f))
            drawCircle(hex("#2c1810"), 0.9f, Offset(-2.5f, -1f))
            drawCircle(hex("#2c1810"), 0.9f, Offset(2.5f, -1f))
            drawLine(hex("#5a3a28"), Offset(-4f, -2.8f), Offset(-1.2f, -2.8f), strokeWidth = 0.7f, cap = StrokeCap.Round)
            drawLine(hex("#5a3a28"), Offset(1.2f, -2.8f), Offset(4f, -2.8f), strokeWidth = 0.7f, cap = StrokeCap.Round)

            val nose = Path().apply {
                moveTo(0f, -0.5f)
                lineTo(-0.6f, 1f)
                lineTo(0.6f, 1f)
            }
            drawPath(nose, hex("#d4a87c"), style = Stroke(width = 0.6f, cap = StrokeCap.Round))

            val mouth = Path().apply {
                moveTo(-1.5f, 2.5f)
                lineTo(0f, 3.3f)
                lineTo(1.5f, 2.5f)
            }
            drawPath(mouth, hex("#c47a5a"), style = Stroke(width = 0.7f, cap = StrokeCap.Round))
        }

        // 八角帽（随头部同步上移）
        translate(0f, -22f) {
            drawRoundRect(hex("#7a6350"), Offset(-7.5f, 0f), Size(15f, 5.5f), CornerRadius(1.5f, 1.5f))
            drawRoundRect(hex("#5a4638"), Offset(-8f, -2.5f), Size(16f, 4f), CornerRadius(2f, 2f))
            drawRoundRect(hex("#3b2a1a"), Offset(-10f, 3f), Size(20f, 3f), CornerRadius(1f, 1f))

            val star = Path().apply {
                moveTo(0f, -3f)
                lineTo(1f, -1.25f)
                lineTo(2.75f, -1f)
                lineTo(1.5f, -0.1f)
                lineTo(2f, 1.5f)
                lineTo(0f, 0.5f)
                lineTo(-2f, 1.5f)
                lineTo(-1.5f, -0.1f)
                lineTo(-2.75f, -1f)
                lineTo(-1f, -1.25f)
                close()
            }
            drawPath(star, hex("#c41e3a"))
        }

        // 步枪
        translate(0f, -10f) {
            drawLine(hex("#4a3520"), Offset(-6f, 12f), Offset(6f, -6f), strokeWidth = 2f, cap = StrokeCap.Round)
            drawRoundRect(hex("#3b2a1a"), Offset(-6f, 11.5f), Size(3f, 4f), CornerRadius(0.5f, 0.5f))
            drawRoundRect(hex("#4a3520"), Offset(4f, -7f), Size(2.5f, 3f), CornerRadius(0.5f, 0.5f))
        }
    }
}

// ====================================================================
// 顶部装饰
// ====================================================================

private const val Margin = 18f

private fun DrawScope.drawTopDecorations(progressText: String, textMeasurer: TextMeasurer) {
    val w = GameData.CanvasWidth
    val h = GameData.CanvasHeight

    drawCorner(Margin + 8, Margin + 8, 0f)
    drawCorner(w - Margin - 8, Margin + 8, 90f)
    drawCorner(w - Margin - 8, h - Margin - 8, 180f)
    drawCorner(Margin + 8, h - Margin - 8, 270f)

    // 标题
    drawRoundRect(hexAlpha("#f4e4c1", 0.18f), Offset(Margin + 12, Margin + 8), Size(140f, 34f), CornerRadius(4f, 4f))
    drawRoundRect(
        hexAlpha("#a08060", 0.3f),
        Offset(Margin + 12, Margin + 8),
        Size(140f, 34f),
        CornerRadius(4f, 4f),
        style = Stroke(width = 1f),
    )
    drawText("长征路线图", Margin + 22, Margin + 20, 16f, hex("#3b2a1a"), FontFamily.Serif, FontWeight.Bold, textMeasurer)
    drawText("1934 — 1936", Margin + 22, Margin + 36, 9f, hex("#8b7355"), FontFamily.Serif, FontWeight.Normal, textMeasurer)

    // 底部进度条
    drawRoundRect(
        hexAlpha("#1c0e08", 0.75f),
        Offset(Margin + 6, h - 46),
        Size(w - (Margin + 6) * 2, 28f),
        CornerRadius(4f, 4f),
    )
    drawText(progressText, Margin + 16, h - 31, 12f, hex("#d4b896"), FontFamily.Serif, FontWeight.Normal, textMeasurer)
}

private fun DrawScope.drawCorner(x: Float, y: Float, rotation: Float) {
    translate(x, y) {
        rotate(rotation, Offset.Zero) {
            val path = Path().apply {
                moveTo(0f, 0f)
                lineTo(36f, 0f)
                lineTo(36f, 3f)
                lineTo(3f, 3f)
                lineTo(3f, 36f)
                lineTo(0f, 36f)
                close()
            }
            drawPath(path, hexAlpha("#b8860b", 0.3f))
            drawPath(path, hex("#8b6914"), style = Stroke(width = 0.5f))
        }
    }
}

private fun clamp(v: Float, lo: Float, hi: Float): Float = max(lo, min(v, hi))
