package com.longmarch.game.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// 进程级单例 DataStore（Android 官方推荐方式）
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "progress")

data class ProgressData(
    val completedLevels: Set<Int>,
    val playerStationId: Int,
)

class ProgressRepository(private val context: Context) {

    private val completedKey = stringPreferencesKey("completed_levels")
    private val stationKey = intPreferencesKey("player_station_id")

    val progress: Flow<ProgressData> = context.dataStore.data.map { prefs ->
        val completed = prefs[completedKey]
            ?.split(",")
            ?.mapNotNull { it.toIntOrNull() }
            ?.filter { it in 1..10 }
            ?.toSet()
            ?: emptySet()

        ProgressData(
            completedLevels = completed,
            playerStationId = (prefs[stationKey] ?: 1).coerceIn(1, 10),
        )
    }

    suspend fun save(progress: ProgressData) {
        context.dataStore.edit { prefs ->
            prefs[completedKey] = progress.completedLevels.sorted().joinToString(",")
            prefs[stationKey] = progress.playerStationId
        }
    }
}
