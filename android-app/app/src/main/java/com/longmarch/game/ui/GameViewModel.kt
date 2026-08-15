package com.longmarch.game.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.longmarch.game.data.GameData
import com.longmarch.game.data.LevelInfo
import com.longmarch.game.data.LevelStatus
import com.longmarch.game.data.ProgressData
import com.longmarch.game.data.ProgressRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

data class GameUiState(
    val playerX: Float = 0f,
    val playerY: Float = 0f,
    val isWalking: Boolean = false,
    val walkPhase: Float = 0f,
    val walkedUpTo: Int = 1,
    val selectedLevelId: Int? = null,
    val lockedTitle: String? = null,
    val lockedDesc: String? = null,
    val completedLevels: Set<Int> = emptySet(),
    val playerStationId: Int = 1,
) {
    val currentLevel: Int get() = min(10, (completedLevels.maxOrNull() ?: 0) + 1)

    val progressText: String
        get() = "当前进度：第 $currentLevel / ${GameData.levels.size} 关  |  点击关卡节点继续征程"

    val isLockedInfoVisible: Boolean get() = lockedTitle != null

    fun status(id: Int): LevelStatus = when {
        id in completedLevels -> LevelStatus.COMPLETED
        id <= currentLevel -> LevelStatus.AVAILABLE
        else -> LevelStatus.LOCKED
    }

    fun stars(id: Int): Int = if (id in completedLevels) 3 else 0
}

class GameViewModel(application: Application) : AndroidViewModel(application) {

    companion object {
        const val PlayerYOffset = 25f
    }

    private val repository = ProgressRepository(application)

    private val _uiState = MutableStateFlow(GameUiState())
    val uiState: StateFlow<GameUiState> = _uiState.asStateFlow()

    private var walkJob: Job? = null

    init {
        viewModelScope.launch {
            val progress = repository.progress.first()
            val start = GameData.levels.first { it.id == progress.playerStationId }
            _uiState.update {
                it.copy(
                    playerX = start.x,
                    playerY = start.y - PlayerYOffset,
                    playerStationId = progress.playerStationId,
                    walkedUpTo = progress.playerStationId,
                    completedLevels = progress.completedLevels,
                )
            }
        }
    }

    fun clickStation(id: Int) {
        val level = GameData.levels.first { it.id == id }
        _uiState.update { it.copy(selectedLevelId = id) }

        if (_uiState.value.status(id) == LevelStatus.LOCKED) {
            _uiState.update { it.copy(lockedTitle = level.mapLabel, lockedDesc = level.shortDesc) }
            return
        }

        dismissLockedInfo()
        startWalk(id)
    }

    fun dismissLockedInfo() {
        if (!_uiState.value.isLockedInfoVisible) return
        _uiState.update { it.copy(lockedTitle = null, lockedDesc = null) }
    }

    fun reset() {
        walkJob?.cancel()
        val start = GameData.levels.first { it.id == 1 }
        _uiState.update {
            it.copy(
                isWalking = false,
                walkPhase = 0f,
                playerStationId = 1,
                walkedUpTo = 1,
                selectedLevelId = null,
                lockedTitle = null,
                lockedDesc = null,
                completedLevels = emptySet(),
                playerX = start.x,
                playerY = start.y - PlayerYOffset,
            )
        }
        save()
    }

    // ==================================================================
    // 行走动画（与 Windows 版 DispatcherTimer 逻辑一致）
    // ==================================================================

    private fun startWalk(targetId: Int) {
        if (_uiState.value.isWalking) return

        val path = buildPath(_uiState.value.playerStationId, targetId)
        if (path.size < 2) {
            completeArrival(targetId)
            return
        }

        walkJob = viewModelScope.launch {
            val walkStart = System.currentTimeMillis()
            _uiState.update { it.copy(isWalking = true) }

            for (segIndex in 0 until path.size - 1) {
                val from = path[segIndex]
                val to = path[segIndex + 1]
                val dx = to.x - from.x
                val dy = (to.y - PlayerYOffset) - (from.y - PlayerYOffset)
                val dist = sqrt(dx * dx + dy * dy)
                val segDurMs = max(dist / 80f, 0.3f) * 1000f
                val segStart = System.currentTimeMillis()

                while (isActive) {
                    val now = System.currentTimeMillis()
                    val phase = ((now - walkStart).toFloat() % 400f) / 400f
                    val elapsed = (now - segStart).toFloat()
                    val raw = (elapsed / segDurMs).coerceIn(0f, 1f)
                    val t = if (raw < 0.5f) 2f * raw * raw else -1f + (4f - 2f * raw) * raw
                    val px = from.x + dx * t
                    val py = (from.y - PlayerYOffset) + dy * t

                    _uiState.update { it.copy(playerX = px, playerY = py, walkPhase = phase) }
                    if (raw >= 1f) break
                    delay(16)
                }

                _uiState.update { it.copy(walkedUpTo = to.id) }
            }

            completeArrival(targetId)
        }
    }

    private fun buildPath(fromId: Int, toId: Int): List<LevelInfo> {
        val start = min(fromId, toId)
        val end = max(fromId, toId)
        val list = (start..end).map { id -> GameData.levels.first { it.id == id } }
        return if (toId < fromId) list.reversed() else list
    }

    private fun completeArrival(id: Int) {
        val level = GameData.levels.first { it.id == id }
        _uiState.update { state ->
            state.copy(
                playerX = level.x,
                playerY = level.y - PlayerYOffset,
                playerStationId = id,
                walkedUpTo = id,
                walkPhase = 0f,
                isWalking = false,
                completedLevels = state.completedLevels + id,
            )
        }
        save()
    }

    private fun save() {
        val s = _uiState.value
        viewModelScope.launch {
            repository.save(ProgressData(s.completedLevels, s.playerStationId))
        }
    }
}
