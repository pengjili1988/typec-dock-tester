# GitHub Actions CI/CD 快速开始

## 📋 操作清单

### 第一步：创建 GitHub 仓库（3分钟）

1. **打开 GitHub**: https://github.com
2. **登录账号**
3. **点击 "New repository"**（右上角 + 号）
4. **填写信息**:
   - Repository name: `typec-dock-tester`
   - Description: `Type-C Dock 产测软件 - Tauri + Vue 3`
   - Public 或 Private（私有仓库更安全）
5. **不要勾选** "Add a README file"（我们已有）
6. **点击 "Create repository"**

### 第二步：连接本地代码到 GitHub（2分钟）

在本地 PowerShell 中运行：

```powershell
cd D:\typec-dock-tester

# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/typec-dock-tester.git

# 推送代码
git push -u origin master
```

### 第三步：验证自动构建（5-10分钟）

1. 打开 https://github.com/YOUR_USERNAME/typec-dock-tester
2. 点击顶部 **Actions** 标签
3. 应该看到 "Build Tauri App" 正在运行
4. 等待变为 ✅ 绿色勾（表示成功）

### 第四步：下载构建产物

1. 点击构建成功的 workflow
2. 向下滚动到 **Artifacts** 部分
3. 点击 **bundles** 下载
4. 解压 ZIP 文件
5. 运行 `.exe` 或安装 `.msi`

---

## 🎯 GitHub 操作截图指引

### 创建仓库
```
[New repository] → Repository name: typec-dock-tester → Create repository
```

### 推送代码后查看 Actions
```
仓库主页 → [Actions] 标签 → 查看 "Build Tauri App" 状态
```

### 下载产物
```
Actions → 点击构建任务 → [Artifacts] → bundles → Download
```

---

## 📝 需要你提供的信息

完成以下步骤后，请告诉我：

1. ✅ 你已创建 GitHub 仓库（给我仓库链接）
2. ✅ 代码已推送成功
3. ✅ CI/CD 构建状态（成功/失败）

如果构建失败，帮我查看 Actions 日志并截图错误信息。
