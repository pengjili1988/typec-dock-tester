# CI/CD 构建指南

本项目使用 GitHub Actions 进行自动化构建。

## 自动构建流程

### 1. 创建 GitHub 仓库（手动）

1. 打开 GitHub 网站: https://github.com
2. 点击右上角 **New repository**
3. 仓库名称填写: `typec-dock-tester`
4. 选择 **Private** 或 **Public**
5. 点击 **Create repository**

### 2. 推送代码到 GitHub

在本地 PowerShell 或 CMD 中执行以下命令：

```powershell
cd D:\typec-dock-tester

# 添加远程仓库（将 YOUR_USERNAME 替换为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/typec-dock-tester.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: TypeC Dock Tester"

# 推送（可能需要输入 GitHub 用户名和密码/Token）
git push -u origin main
```

**注意**: 如果使用 GitHub 2FA，推荐使用 Personal Access Token 代替密码。

### 3. 验证构建

1. 推送代码后，打开你的 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 应该能看到 "Build Tauri App" 工作流正在运行
4. 等待构建完成（约5-10分钟）

### 4. 下载构建产物

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 选择最新的构建任务
3. 点击 **Artifacts** 部分
4. 下载 `bundles` 文件

## 手动构建（本机环境）

如果想在本机构建，复制以下脚本到 PowerShell:

```powershell
# 设置环境
$env:PATH = "C:\Users\Administrator\.cargo\bin;C:\Users\Administrator\mingo81\mingw64\bin;$env:PATH"

# 进入项目目录
cd D:\typec-dock-tester

# 清理旧构建
Remove-Item -Recurse -Force src-tauri/target -ErrorAction SilentlyContinue

# 安装依赖
npm ci

# 构建 Tauri 应用
npm run tauri build

# 查看产物
Get-ChildItem src-tauri/target/release/bundle
```

## 产物位置

构建成功后，可执行文件位于:

- Windows: `src-tauri/target/release/bundle/msi/*.msi`
- Windows Installer: `src-tauri/target/release/bundle/nsis/*.exe`
