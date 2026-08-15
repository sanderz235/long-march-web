# 本地运行网页（前端）

本项目前端是一个 React + Vite 应用，位于 `client` 目录。

## 环境要求

- 已安装 [Node.js](https://nodejs.org/)（建议 18 及以上版本，本机已有即可）

## 启动步骤

### 1. 安装依赖（首次运行时才需要）

打开终端，进入 `client` 目录：

```powershell
cd d:\Codefield\long_march\client
npm install
```

> 如果之前已经安装过（目录里已有 `node_modules`），可跳过这一步。

### 2. 启动开发服务器

继续在 `client` 目录下执行：

```powershell
npm run dev
```

### 3. 打开网页

启动成功后，终端会显示类似下面的地址：

```
  VITE v8.2.0  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

用浏览器打开 `http://localhost:5173/` 即可访问。

## 其他命令

| 命令 | 作用 |
| ---- | ---- |
| `npm run dev` | 启动开发服务器（本地预览） |
| `npm run build` | 打包生产版本到 `dist` 目录 |
| `npm run preview` | 本地预览已打包的生产版本 |
| `npm run lint` | 代码检查 |

## 常见问题

- **端口被占用**：如果 5173 端口被占用，Vite 会自动换到 5174 等端口，以终端实际输出为准。
- **修改代码后页面没更新**：Vite 支持热更新，保存文件后浏览器会自动刷新；若没生效，手动刷新页面即可。
- **首次启动很慢**：属于正常现象，等待依赖解析完成即可。
