# TYPE-C扩展坞产测系统

> XFANIC TYPE-C Dock TYPE-C 多功能测试软件

一款基于 Tauri 2.x + Vue 3 + Element Plus + SQLite 技术栈开发的 TYPE-C 扩展坞生产测试系统。

## 技术栈

- **前端框架**: Vue 3 + TypeScript + Composition API
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **国际化**: vue-i18n (支持中文/越南语)
- **桌面框架**: Tauri 2.x
- **数据库**: SQLite (rusqlite)
- **构建工具**: Vite

## 功能特性

- ✅ USB/视频/音频/网络/PD充电/SD卡/固件测试
- ✅ 参数配置导入/导出
- ✅ MES系统对接 (可选)
- ✅ 扫码功能 (可选)
- ✅ 打印功能 (可选)
- ✅ 中越双语支持
- ✅ 测试报告生成

## 项目结构

```
dock-tester/
├── src/                      # 前端源码
│   ├── assets/              # 静态资源
│   ├── components/          # Vue组件
│   │   ├── common/          # 通用组件
│   │   ├── test/            # 测试组件
│   │   └── config/          # 配置组件
│   ├── views/               # 页面视图
│   ├── stores/              # Pinia状态管理
│   ├── services/            # 业务服务
│   ├── locales/             # 国际化文件
│   ├── router/              # 路由配置
│   ├── types/               # TypeScript类型
│   └── utils/               # 工具函数
├── src-tauri/               # Tauri后端源码
│   ├── src/
│   │   ├── commands/        # Tauri命令
│   │   └── main.rs          # 入口
│   └── Cargo.toml           # Rust依赖
├── package.json
└── vite.config.ts
```

## 快速开始

### 环境要求

- Node.js >= 18
- Rust >= 1.70
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 安装前端依赖
pnpm install

# 安装Rust依赖 (自动通过cargo)
```

### 开发模式

```bash
# 启动开发服务器
pnpm tauri dev
```

### 构建应用

```bash
# 构建生产版本
pnpm tauri build
```

## 配置说明

### 测试参数配置

测试参数存储在 `configs/` 目录下，使用JSON格式：

```json
{
  "version": "1.0.0",
  "name": "USBC-001 测试配置",
  "product": {
    "model": "USBC-001",
    "vid": "0x1234",
    "pid": "0x5678"
  },
  "testItems": {
    "usb": true,
    "video": true,
    "audio": true,
    "network": true,
    "pd": true,
    "sd": true,
    "firmware": true
  }
}
```

### MES配置

在设置页面配置MES服务器信息：
- 服务器地址
- API密钥
- 工厂代码
- 产线代码

## 开发指南

### 添加新的测试项

1. 在 `src/types/config.ts` 中定义配置类型
2. 在 `src/stores/testStore.ts` 中添加测试项定义
3. 在 `src/services/testService.ts` 中实现测试逻辑
4. 在 Tauri 后端添加相应的命令

### 国际化

- 中文: `src/locales/zh-CN.json`
- 越南语: `src/locales/vi-VN.json`

添加新翻译时需要同时更新两个文件。

## 构建说明

### Windows

```bash
pnpm tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

## 许可证

MIT License

## 技术支持

如有问题，请联系开发团队。
