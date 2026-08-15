# 长征路线图 — Android 版

基于 **Kotlin + Jetpack Compose + MVVM** 的安卓应用，只移植原 Web 项目中的「地图闯关」部分：
中国地图底图、长征路线、10 个站点、红军小人行走动画、关卡解锁/进度状态。
不包含答题、学习页等内容。

---

## 一、技术栈

| 类别 | 技术 |
|:---|:---|
| 语言 | Kotlin 2.0.21 |
| UI 框架 | Jetpack Compose（Material 3） |
| 构建 | Android Gradle Plugin 8.7.3、Gradle 8.9 |
| 架构 | MVVM（`ViewModel` + `StateFlow` + 单向数据流） |
| 数据持久化 | Jetpack DataStore Preferences |
| 协程 | Kotlin Coroutines 1.9.0 |
| 自绘 / 动画 | Compose `Canvas` + `delay(16)` 帧循环 |

---

## 二、项目结构

```
android-app/
├── settings.gradle.kts            # 项目名、模块声明、仓库配置
├── build.gradle.kts               # 顶层：声明 AGP / Kotlin / Compose 插件版本
├── gradle.properties              # Gradle / AndroidX / Kotlin 配置
├── gradle/
│   └── wrapper/
│       └── gradle-wrapper.properties   # Gradle 8.9 发行版地址
└── app/
    ├── build.gradle.kts           # app 模块：SDK 版本、依赖、Compose 配置
    ├── proguard-rules.pro         # 混淆规则（release 未开启 minify，保持为空）
    └── src/main/
        ├── AndroidManifest.xml    # 应用清单、主题、启动 Activity
        ├── java/com/longmarch/game/
        │   ├── MainActivity.kt            # 入口 Activity
        │   ├── data/
        │   │   ├── GameData.kt            # 逻辑画布尺寸 + 10 个站点数据
        │   │   └── ProgressRepository.kt  # DataStore 存档读写
        │   └── ui/
        │       ├── GameViewModel.kt       # 游戏状态 + 行走动画 + 进度
        │       ├── MapRenderer.kt         # Compose Canvas 自绘逻辑
        │       └── MapGameScreen.kt       # 界面组装 + 手势命中
        └── res/
            ├── drawable-nodpi/
            │   └── map_bg.png            # 羊皮纸中国地图底图（2406×1299）
            └── values/
                ├── colors.xml            # 背景深色
                ├── strings.xml           # 应用名「长征路线图」
                └── themes.xml            # 全屏深色主题
```

---

## 三、架构设计

采用标准 **MVVM + 单向数据流（UDF）**：

```
MainActivity
    └─ setContent { MaterialTheme { MapGameScreen(viewModel) } }
                                        │
MapGameScreen (View)  ──collectAsState──▶  GameViewModel.uiState (StateFlow<GameUiState>)
        │                                              │
        │ 点击 / 手势                                     ├─▶ ProgressRepository (DataStore)
        ▼                                              └─▶ GameData (静态站点数据)
    MapRenderer.drawMap(...)
```

- **Model（数据层）**：
  - `GameData`：静态站点数据与逻辑画布尺寸。
  - `ProgressRepository`：封装 DataStore 的读取（`Flow`）与写入（`suspend`）。
- **ViewModel（业务层）**：
  - `GameViewModel` 继承 `AndroidViewModel`，持有 `MutableStateFlow<GameUiState>`。
  - 通过 `viewModelScope` 启动协程驱动行走动画与存档。
- **View（界面层）**：
  - `MapGameScreen` 收集 `uiState`，用 Compose `Canvas` 绘制并处理点击。
  - `MapRenderer` 为纯绘制函数（`DrawScope` 扩展），与 Windows 版 `MapRenderer` 一一对应。

---

## 四、核心功能

### 1. 地图与路线
- 逻辑画布固定为 **802 × 433**（与前端 / Windows 版完全一致）。
- 路线绘制三层：灰色完整路线 → 红色已走路线 → 红色虚线叠加。

### 2. 关卡节点状态机
`LevelStatus` 三种状态，由 `GameUiState.status(id)` 计算：

| 状态 | 触发条件 | 视觉表现 |
|:---|:---|:---|
| `LOCKED` | `id > currentLevel` | 灰色节点 + 🔒 |
| `AVAILABLE` | `id == currentLevel` 且未完成 | 橙色节点 |
| `COMPLETED` | 在 `completedLevels` 集合中 | 绿色节点 + 3 颗星 |

`currentLevel = min(10, (completedLevels.maxOrNull() ?: 0) + 1)`，首关（瑞金）默认可用。

### 3. 红军小人行走动画
- 点击可到达站点后，`startWalk` 协程按路径逐段移动小人。
- 速度 **80px/s**、每段最短 **0.3s**、`easeInOut` 缓动、每帧 `delay(16)`（约 60fps）。
- `walkPhase = (总耗时 % 400ms) / 400ms` 驱动腿、臂、身体摆动。
- 到达后将该关卡加入 `completedLevels` 并保存。

### 4. 交互
- **点击站点**：`detectTapGestures` 反算逻辑坐标，命中半径 20px。
  - 未解锁 → 显示锁定信息卡（站点名、简介、🔒）。
  - 已解锁 → 关闭信息卡并开始行走。
- **重走长征路**：清空进度、回到瑞金并重置存档。

### 5. 屏幕适配
- `computeTransform` 使用 contain letterbox：按逻辑画布等比缩放并居中，黑边填充，
  点击坐标通过反向 `(tap - offset) / scale` 还原到逻辑坐标。

### 6. 视觉装饰
- 顶部四角复古装饰、左上角「长征路线图 / 1934—1936」标题、底部进度条文字。

---

## 五、数据存储

- **存储方式**：Jetpack DataStore Preferences，文件名 `progress`。
- **实际位置**：`/data/data/com.longmarch.game/files/datastore/progress.preferences_pb`
  （应用私有目录，随卸载清除）。

- **存储字段**：

  | Key | 类型 | 说明 |
  |:---|:---|:---|
  | `completed_levels` | String | 已完成关卡 ID，逗号分隔，如 `"1,2,3"` |
  | `player_station_id` | Int | 小人当前所在站点 ID（1~10） |

- **读取逻辑**：`ProgressRepository.progress` 暴露 `Flow<ProgressData>`，启动时取第一个值初始化。
  空值或越界自动回退（`completedLevels` 为空集、`playerStationId` 收敛到 1~10）。
- **写入逻辑**：`save()` 通过 `context.dataStore.edit` 原子写入，在到达新站点或重置时触发。

---

## 六、地图底图资源

- `res/drawable-nodpi/map_bg.png` 由 `client/generate_map_image.mjs` 静态生成（SVG → 3x 光栅化）。
- 尺寸 **2406×1299**，对应 802×433 逻辑画布的 3 倍密度。
- 放在 `drawable-nodpi` 目录，避免 Android 对位图做密度缩放，保证按原始像素绘制。
- 图层顺序（自下而上）：底色 → 羊皮纸 → 罗盘线 → 省份 → 做旧老化 → 褶皱线 → 污渍 →
  罗盘标尺。省份位于褶皱/做旧效果之下。

---

## 七、编译 / 运行 / 打包

### 前置要求
- JDK 17
- Android SDK（`compileSdk 35`、`minSdk 24`、`targetSdk 35`）
- 建议使用 **Android Studio**（会自动处理 SDK 与 Gradle 版本）

### 方式一：Android Studio（推荐）
1. `File → Open` 选择 `android-app` 目录。
2. 等待 Gradle 同步完成。
3. 连接设备 / 启动模拟器，点击 Run。

### 方式二：命令行 Gradle
> 当前仓库已提供 `gradle/wrapper/gradle-wrapper.properties`，但**未附带 `gradlew` /
> `gradlew.bat` / `gradle-wrapper.jar`**。因此推荐二选一：

- **A. 使用本机已安装的 Gradle**（需 Gradle 8.9）：

  ```bash
  cd android-app
  gradle :app:assembleDebug     # 生成 debug APK
  gradle :app:installDebug      # 安装到已连接设备
  ```

- **B. 用本机 Gradle 生成 wrapper 后，再用 wrapper 构建**：

  ```bash
  cd android-app
  gradle wrapper --gradle-version 8.9
  ./gradlew :app:assembleDebug    # Windows 下使用 gradlew.bat
  ```

### 打包产物位置

| 构建类型 | 命令 | 输出路径 |
|:---|:---|:---|
| Debug APK | `assembleDebug` | `app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `assembleRelease` | `app/build/outputs/apk/release/app-release.apk` |

> Release 未开启混淆（`isMinifyEnabled = false`），如需发布可自行签名。

---

## 八、站点数据

逻辑画布坐标（左上角为原点）：

| Id | 名称 | 简介 | X | Y |
|:---:|:---|:---|:---:|:---:|
| 1 | 瑞金 | 伟大征程开始 | 649 | 299 |
| 2 | 湘江 | 惨烈突围之战 | 511 | 297 |
| 3 | 遵义 | 生死攸关转折 | 403 | 271 |
| 4 | 赤水 | 用兵如神 | 360 | 245 |
| 5 | 金沙江 | 跳出包围圈 | 277 | 290 |
| 6 | 泸定桥 | 二十二勇士 | 256 | 227 |
| 7 | 雪山 | 翻越夹金山 | 285 | 211 |
| 8 | 草地 | 松潘大草地 | 293 | 175 |
| 9 | 腊子口 | 攻克天险 | 327 | 146 |
| 10 | 吴起镇 | 长征胜利！ | 434 | 104 |
