# 开发调试指南

## 启动开发服务器

在 `client` 目录下打开终端（CMD / PowerShell），执行：

```cmd
cd d:\Codefield\long_march\client
npm run dev
```

启动后会看到：

```
VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

浏览器打开 `http://localhost:5173` 即可看到长征闯关应用。

## 启用调试模式

两种方式，任选一种：

### 方式一：URL 参数（推荐，临时生效）

访问以下地址：

```
http://localhost:5173/game?debug=1
```

进入地图页后，右下角会出现红色 **调试** 按钮。

### 方式二：控制台设置（持久生效）

在浏览器按 `F12` 打开开发者工具 → `Console` 面板，输入：

```js
localStorage.setItem('debug_mode', 'true')
```

然后刷新页面或正常访问 `/game`，右下角即出现调试按钮。

关闭调试模式：

```js
localStorage.removeItem('debug_mode')
```

或直接在调试面板点 "退出调试模式"。

## 调试面板功能

点击右下角红色 **调试** 按钮，展开面板：

- 列出全部 10 个站点（瑞金 → 吴起镇）
- 点击任一站点，自动：
  - 重置所有进度
  - 将前面所有关卡设为 3 星通关
  - 小人走到目标站点的前一个位置
  - 刷新地图
- 点击 "退出调试模式" 恢复正常

> 例：点击 **#10 吴起镇** → 解锁 1~9 关满星，小人站在第 9 站腊子口，可以点开第 10 关答题测试。

## 完整调试流程（以调试吴起镇为例）

```cmd
# 1. 启动服务
cd d:\Codefield\long_march\client
npm run dev

# 2. 浏览器打开
# http://localhost:5173/game?debug=1

# 3. 右下角点"调试" → 点"#10 吴起镇"
# 4. 地图刷新，小人站到腊子口，吴起镇节点解锁
# 5. 点吴起镇节点 → 进入关卡 → 测试答题
```

## 重新生成静态底图

如果省界数据（`chinaGeoData.ts`）有修改，需重新生成底图：

```cmd
cd d:\Codefield\long_march\client
node generate_map_image.mjs
```

会生成/更新 `public/map_bg.svg`，下次 `npm run dev` 或 `npm run build` 时自动生效。
