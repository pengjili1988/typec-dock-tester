# Build Guide - 构建指南

## 🚀 使用 GitHub Actions 自动构建（推荐）

### 步骤 1: 创建 GitHub 仓库

1. 打开 https://github.com 并登录
2. 点击右上角 **+** → **New repository**
3. 填写仓库名称: `typec-dock-tester`
4. 选择 Private（私有）或 Public（公开）
5. 点击 **Create repository**

### 步骤 2: 推送代码到 GitHub

打开本地 **PowerShell** 或 **CMD**，执行以下命令：

```powershell
cd D:\typec-dock-tester

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/typec-dock-tester.git

# 推送到 GitHub
git push -u origin master
```

**注意**: 如果提示需要认证，请使用 Personal Access Token（推荐）或 GitHub CLI。

### 步骤 3: 获取 Personal Access Token

1. 在 GitHub 点击头像 → **Settings**
2. 左侧选择 **Developer settings**
3. 选择 **Personal access tokens** → **Tokens (classic)**
4. 点击 **Generate new token**
5. 勾选 `repo` 权限
6. 复制生成的 Token（只显示一次）

### 步骤 4: 验证 CI/CD 构建

1. 推送代码后，打开你的 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 应该能看到 "Build Tauri App" 工作流正在运行
4. 等待构建完成（约 5-10 分钟）

### 步骤 5: 下载构建产物

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 选择左侧 "Build Tauri App"
3. 点击最新的 workflow run
4. 向下滚动到 **Artifacts** 部分
5. 点击 `bundles` 下载构建产物
6. 解压后运行 `.exe` 文件

---

## 🔧 本地构建（仅当沙箱限制解除后）

```powershell
# 设置环境变量
$env:PATH = "C:\Users\Administrator\.cargo\bin;C:\Users\Administrator\mingo81\mingw64\bin;$env:PATH"

# 进入项目目录
cd D:\typec-dock-tester

# 安装依赖
npm ci

# 构建 Tauri 应用
npm run tauri build

# 查看产物位置
Get-ChildItem src-tauri/target/release/bundle
```

---

## 📦 构建产物

| 平台 | 文件类型 | 位置 |
|------|---------|------|
| Windows | MSI 安装包 | `src-tauri/target/release/bundle/msi/*.msi` |
| Windows | NSIS 安装程序 | `src-tauri/target/release/bundle/nsis/*.exe` |
| Windows | 便携版 EXE | `src-tauri/target/release/*.exe` |

---

## ⚠️ 常见问题

### Q: 构建失败怎么办？
A: 查看 GitHub Actions 日志，通常是依赖问题或代码错误。

### Q: 下载的 artifact 太大？
A: 这是正常的，因为包含完整的运行时环境。

### Q: 如何触发重新构建？
A: 推送新代码到 GitHub，或在 Actions 页面手动点击 "Run workflow"。
