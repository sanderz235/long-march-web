package com.longmarch.game.ui

import android.graphics.BitmapFactory
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.longmarch.game.R
import com.longmarch.game.data.GameData
import kotlin.math.min

@Composable
fun MapGameScreen(viewModel: GameViewModel) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val textMeasurer = rememberTextMeasurer()

    val background: ImageBitmap? = remember {
        BitmapFactory.decodeResource(context.resources, R.drawable.map_bg)?.asImageBitmap()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF120A05)),
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectTapGestures { tap ->
                        val (scale, ox, oy) = computeTransform(size.width.toFloat(), size.height.toFloat())
                        val lx = (tap.x - ox) / scale
                        val ly = (tap.y - oy) / scale
                        val hit = GameData.levels.firstOrNull { level ->
                            val dx = level.x - lx
                            val dy = level.y - ly
                            dx * dx + dy * dy <= 20f * 20f
                        }
                        if (hit != null) viewModel.clickStation(hit.id)
                    }
                },
        ) {
            val width = size.width
            val height = size.height
            drawRect(Color(0xFF120A05))

            val (scale, ox, oy) = computeTransform(width, height)
            val drawW = GameData.CanvasWidth * scale
            val drawH = GameData.CanvasHeight * scale

            background?.let {
                drawImage(
                    image = it,
                    dstOffset = IntOffset(ox.toInt(), oy.toInt()),
                    dstSize = IntSize(drawW.toInt(), drawH.toInt()),
                )
            }

            withTransform({
                translate(ox, oy)
                scale(scale, scale, pivot = Offset.Zero)
            }) {
                drawMap(state, textMeasurer)
            }
        }

        // 锁定节点信息卡
        if (state.isLockedInfoVisible) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xB3100502))
                    .clickable { viewModel.dismissLockedInfo() },
                contentAlignment = Alignment.Center,
            ) {
                Column(
                    modifier = Modifier
                        .widthIn(max = 440.dp)
                        .fillMaxWidth(0.88f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF23140C))
                        .border(2.dp, Color(0x66C8A03CuL), RoundedCornerShape(12.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                        ) {}
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                    ) {
                        Text(
                            text = "✕",
                            color = Color(0xFF8B7355),
                            fontSize = 20.sp,
                            modifier = Modifier.clickable { viewModel.dismissLockedInfo() },
                        )
                    }
                    Text("🔒", fontSize = 48.sp)
                    Text(
                        state.lockedTitle.orEmpty(),
                        color = Color(0xFFF0D68A),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        "— 待解锁 —",
                        color = Color(0xFFC41E3A),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        state.lockedDesc.orEmpty(),
                        color = Color(0xFFD4B896),
                        fontSize = 16.sp,
                    )
                    Text(
                        "请先完成前面的关卡",
                        color = Color(0xFF8B7355),
                        fontSize = 13.sp,
                    )
                }
            }
        }

        // 重走长征路
        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFFC41E3A))
                .clickable { viewModel.reset() }
                .padding(horizontal = 14.dp, vertical = 8.dp),
        ) {
            Text("重走长征路", color = Color(0xFFF4E4C1))
        }
    }
}

private fun computeTransform(width: Float, height: Float): Triple<Float, Float, Float> {
    val scale = min(width / GameData.CanvasWidth, height / GameData.CanvasHeight)
    val drawW = GameData.CanvasWidth * scale
    val drawH = GameData.CanvasHeight * scale
    val ox = (width - drawW) / 2f
    val oy = (height - drawH) / 2f
    return Triple(scale, ox, oy)
}
