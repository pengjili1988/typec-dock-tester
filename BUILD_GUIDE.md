# Type-C Dock Tester - 构建指南

## 项目概述

Type-C Dock Tester 是一款基于 Tauri 2.x 的桌面应用程序，用于测试 Type-C 扩展坞的功能，包括 USB、视频、音频、网络、PD 充电、SD 卡读取和固件更新等功能。

### 技术栈

- **前端**: Vue 3 + Vite + TypeScript + Element Plus + Tailwind CSS
- **后端**: Tauri 2.x + Rust
- **数据库**: SQLite (via rusqlite)
- **状态管理**: Pinia
- **国际化**: vue-i18n

### 项目结构

```
typec-dock-tester/
├── src/                          # 前端 Vue 代码
│   ├── components/               # Vue 组件
│   │   ├── common/              # 通用组件
│   │   ├── config/             # 配置相关组件
│   │   └── test/               # 测试相关组件
│   ├── views/                   # 页面视图
│   ├── stores/                  # Pinia 状态管理
│   ├── services/               # API 服务层
│   ├── types/                  # TypeScript 类型定义
│   ├── router/                 # 路由配置
│   ├── locales/                # 国际化文件
│   └── utils/                  # 工具函数
├── src-tauri/                   # Tauri 后端 Rust 代码
│   ├── src/
│   │   ├── commands/           # Tauri 命令
│   │   │   ├── test_commands.rs
│   │   │   ├── config_commands.rs
│   │   │   └── mes_commands.rs
│   │   ├── database/           # 数据库模块
│   │   │   ├── mod.rs
│   │   │   └── configs.rs
│   │   ├── lib.rs             # 库入口
│   │   └── main.rs            # 主程序入口
│   ├── Cargo.toml              # Rust 依赖配置
│   └── tauri.conf.json         # Tauri 配置
├── src-tauri/icons/            # 应用图标
└── package.json                # Node.js 依赖配置
```

---

## 本地构建步骤

### 环境要求

1. **Node.js** 18+
2. **Rust** 1.70+ (建议使用 rustup 安装)
3. **Visual Studio Build Tools 2022** 或 **MinGW-w64** (用于编译 C 依赖)

### 步骤 1: 安装 Node.js

从 https://nodejs.org 下载并安装 Node.js 18 或更高版本。

### 步骤 2: 安装 Rust

```bash
# 使用 rustup 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 或者在 Windows 上从 https://rustup.rs 下载安装
```

### 步骤 3: 安装 C++ 构建工具

**选项 A: Visual Studio Build Tools (推荐)**
1. 下载 Visual Studio Build Tools 2022: https://visualstudio.microsoft.com/downloads/
2. 安装时选择 "C++ 生成工具" 工作负载
3. 确保勾选 Windows 10/11 SDK

**选项 B: MinGW-w64**
1. 下载 MinGW-w64: https://www.mingw-w64.org/
2. 推荐使用 MSYS2: https://www.msys2.org/
3. 安装后确保 `gcc`, `g++`, `dlltool` 在系统 PATH 中

### 步骤 4: 克隆并安装依赖

```bash
# 进入项目目录
cd typec-dock-tester

# 安装 Node.js 依赖
npm install

# 安装 Rust 依赖 (自动)
cd src-tauri && cargo fetch && cd ..
```

### 步骤 5: 配置构建工具 (如使用 MinGW)

如果使用 MinGW 而非 Visual Studio，需要创建 Cargo 配置文件：

```bash
mkdir -p src-tauri/.cargo
```

创建 `src-tauri/.cargo/config.toml`:

```toml
[target.x86_64-pc-windows-gnu]
linker = "C:/path/to/mingw64/bin/gcc.exe"
ar = "C:/path/to/mingw64/bin/ar.exe"

[build]
target-dir = "C:/Users/YourUsername/.cargo-target"
```

### 步骤 6: 构建应用

**开发模式 (热重载)**:
```bash
npm run tauri dev
```

**生产构建**:
```bash
npm run tauri build
```

构建完成后，可执行文件位于:
- `src-tauri/target/release/dock-tester.exe` (Windows)
- 或 `src-tauri/target/release/bundle/msi/` 下的 MSI 安装包

---

## 功能模块说明

### 1. 测试模块 (Test Module)

| 功能 | 描述 |
|------|------|
| USB 测试 | 测试 USB 3.0 端口速度、电压范围、VID/PID 检测 |
| 视频测试 | 测试 HDMI/DP 视频输出 |
| 音频测试 | 测试音频输入/输出 |
| 网络测试 | 测试以太网连接、MAC 地址验证 |
| PD 测试 | 测试 Power Delivery 充电功能 |
| SD 卡测试 | 测试 SD 卡读写功能 |
| 固件更新 | 设备固件升级 |

### 2. 配置模块 (Config Module)

- 参数配置管理
- 配置导入/导出 (JSON 格式)
- 产品型号、VID/PID 等基础配置

### 3. MES 集成 (MES Integration)

- MES 系统连接 (服务器 URL、API Key 配置)
- 工单获取
- 测试结果上传

### 4. 数据存储

- SQLite 数据库存储配置和测试历史
- 数据目录: `%APPDATA%/dock-tester/`

---

## 常见问题

### Q: 编译时提示 `dlltool not found`?

**解决方案**: 确保 MinGW 的 bin 目录在 PATH 中，或安装 Visual Studio Build Tools。

### Q: 编译时提示 `link.exe` 错误?

**解决方案**: 
1. 如果使用 GNU 工具链，确保 PATH 中没有冲突的 `link` 命令
2. 或切换到 MSVC 工具链: `rustup default stable-x86_64-pc-windows-msvc`

### Q: 运行时报错 `WebView2 not found`?

**解决方案**: 安装 WebView2 Runtime: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Q: 编译内存不足?

**解决方案**: 
```bash
# 设置增量编译
export CARGO_INCREMENTAL=1

# 或增加 jobs
npm run tauri build -- --jobs 2
```

---

## 开发说明

### 前端开发

```bash
# 单独启动前端开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format
```

### 后端开发

```bash
# 进入 Rust 目录
cd src-tauri

# 检查代码
cargo check

# 运行测试
cargo test

# 格式化代码
cargo fmt
```

---

## 构建输出

构建成功后，会在以下位置生成文件：

| 平台 | 路径 |
|------|------|
| Windows EXE | `src-tauri/target/release/dock-tester.exe` |
| Windows MSI | `src-tauri/target/release/bundle/msi/*.msi` |
| Windows NSIS | `src-tauri/target/release/bundle/nsis/*.exe` |

---

## 许可证

本项目为内部使用项目。
