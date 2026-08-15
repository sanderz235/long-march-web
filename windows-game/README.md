# 长征路线图 — Windows 版

基于 **C# / .NET 9 + WPF + SkiaSharp** 的桌面游戏，只移植原 Web 项目中的「地图闯关」部分：
中国地图底图、长征路线、10 个站点、红军小人行走动画、关卡解锁/进度状态。
不包含答题、学习页等内容。

---

## 一、技术栈

| 类别 | 技术 |
|:---|:---|
| 语言 / 运行时 | C#、.NET 9 |
| UI 框架 | WPF（XAML） |
| 自绘 / 2D 渲染 | SkiaSharp 2.88.9（`SkiaSharp.Views.WPF`） |
| 动画驱动 | `DispatcherTimer`（16ms） |
| 数据序列化 | `System.Text.Json` |
| 架构 | 轻量 MVVM |

---

## 二、项目结构

```
windows-game/
├── LongMarchWindows.csproj        # 项目文件（.NET 9 + WPF + SkiaSharp）
├── App.xaml / App.xaml.cs         # 应用入口，StartupUri 指向 MainWindow
├── MainWindow.xaml / .cs          # 主窗口：地图控件 + 锁定信息卡 + 重置按钮
├── Assets/
│   └── map_bg.png                 # 羊皮纸中国地图底图（2406×1299，3x 逻辑画布）
├── Controls/
│   └── MapGameControl.cs          # SKElement 自绘控件，处理绘制与点击命中
├── Data/
│   └── GameData.cs                # 逻辑画布尺寸 + 10 个站点数据
├── Models/
│   ├── LevelInfo.cs               # 站点模型（Id/名称/简介/坐标）
│   └── LevelStatus.cs             # 关卡状态枚举
├── Rendering/
│   └── MapRenderer.cs             # 全部 Skia 绘制逻辑（路线/节点/小人/装饰）
├── Services/
│   └── ProgressStore.cs           # 存档读写（JSON）
└── ViewModels/
    └── GameViewModel.cs           # 游戏状态、行走动画、进度逻辑
```

---

## 三、架构设计

采用轻量 **MVVM**：

```
MainWindow (View, XAML)
     │  DataContext = GameViewModel
     ▼
MapGameControl (View, 自绘控件)  ──绑定──▶  GameViewModel (ViewModel)
                                                │
                                                ├─▶ GameData      (静态站点数据)
                                                ├─▶ ProgressStore (存档服务)
                                                └─▶ MapRenderer   (纯绘制，无状态)
```

- **View 层**：`MainWindow` 负责布局与叠加层（锁定信息卡、重置按钮）；`MapGameControl`
  负责把 `GameViewModel` 的可视状态绘制到屏幕，并处理鼠标点击。
- **ViewModel 层**：`GameViewModel` 持有全部游戏状态（玩家坐标、行走中、已解锁关卡等），
  通过 `INotifyPropertyChanged` 通知视图刷新。
- **渲染层**：`MapRenderer` 是纯静态绘制类，接收 `SKCanvas` 与 `GameViewModel`，
  不保存任何状态，便于与 Android 版一一对应。
- **数据层**：`ProgressStore` 负责存档的加载与保存。

---

## 四、核心功能

### 1. 地图与路线
- 逻辑画布固定为 **802 × 433**（与前端 / Android 版完全一致）。
- 路线绘制三层：
  - 灰色完整路线（所有站点连成的折线）
  - 红色已走路线（`walkedUpTo` 之前的线段）
  - 红色虚线叠加（增强“已行进”的视觉层次）

### 2. 关卡节点状态机
`LevelStatus` 三种状态：

| 状态 | 触发条件 | 视觉表现 |
|:---|:---|:---|
| `Locked` | `id > CurrentLevel` | 灰色节点 + 🔒 |
| `Available` | `id == CurrentLevel` 且未完成 | 橙色节点 |
| `Completed` | 在已完成集合中 | 绿色节点 + 3 颗星 |

`CurrentLevel = min(10, 已完成最大关卡 + 1)`，首关（瑞金）默认可用。

### 3. 红军小人行走动画
- 点击可到达的站点后，小人从当前站点沿路线逐段走向目标站点。
- 速度 **80px/s**，每段最短 **0.3s**，`easeInOut` 缓动。
- `WalkPhase = (总耗时 % 400ms) / 400ms` 驱动腿、臂、身体的摆动。
- 到达目标后将该关卡加入已完成集合并保存进度。

### 4. 交互
- **点击站点**：命中半径 20px。
  - 未解锁 → 弹出锁定信息卡（站点名、简介、🔒、关闭按钮）。
  - 已解锁 → 关闭信息卡并开始行走。
- **重走长征路**：清空进度、回到瑞金并重置存档。

### 5. 视觉装饰
- 顶部四角复古装饰边框。
- 左上角「长征路线图 / 1934—1936」标题。
- 底部进度条文字：`当前进度：第 N / 10 关  |  点击关卡节点继续征程`。

---

## 五、数据存储

- **存储路径**：

  ```
  %AppData%\LongMarchWindows\progress.json
  ```

  即 `C:\Users\<用户名>\AppData\Roaming\LongMarchWindows\progress.json`。

- **数据格式**：

  ```json
  {
    "CompletedLevels": [1, 2, 3],
    "PlayerStationId": 3
  }
  ```

  | 字段 | 类型 | 说明 |
  |:---|:---|:---|
  | `CompletedLevels` | `int[]` | 已完成关卡 ID 列表（升序） |
  | `PlayerStationId` | `int` | 小人当前所在站点 ID（1~10） |

- **读取逻辑**：程序启动时加载；若文件不存在或 JSON 损坏，回退到初始进度（瑞金、无已完成关卡）。
- **写入逻辑**：每次到达新站点、或点击「重走长征路」时保存；写入失败不影响游戏运行。

---

## 六、地图底图资源

- `Assets/map_bg.png` 由 `client/generate_map_image.mjs` 静态生成（SVG → 3x 光栅化）。
- 尺寸 **2406×1299**，对应 802×433 逻辑画布的 3 倍密度，保证高分屏清晰。
- 图层顺序（自下而上）：底色 → 羊皮纸 → 罗盘线 → 省份 → 做旧老化 → 褶皱线 → 污渍 →
  罗盘标尺。省份位于褶皱/做旧效果之下，边缘做旧覆盖在地图内容之上。
- 运行时由 `MapGameControl.LoadBackground()` 从 `AppContext.BaseDirectory/Assets/map_bg.png` 加载。

---

## 七、编译 / 运行 / 发布

### 前置要求
- 安装 [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)。

### 编译并运行（调试）

```powershell
cd d:\Codefield\long_march\windows-game
dotnet run
```

### 仅编译

```powershell
dotnet build -c Release
```

### 发布为独立可执行文件

```powershell
# 单文件、自包含（目标机器无需安装 .NET）
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

发布输出位于：

```
windows-game\bin\Release\net9.0-windows\win-x64\publish\
```

运行 `LongMarchWindows.exe` 即可。首次运行会自动创建存档目录。

> 说明：`SkiaSharp.Views.WPF` 2.88.9 会随发布拷贝原生 `libSkiaSharp.dll`，
> 自包含发布时无需额外处理。

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
