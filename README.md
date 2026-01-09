# learnflow/starter

开源可运行示例，演示计时 → 记录 → 积分 → 总览的 MVP 闭环。

## 技术选型（v1.1）
- Next.js + TypeScript + Tailwind
- Biome（格式化与 lint）
- pnpm（默认包管理器）
- swc + tsc（编译与类型检查）
- 可安装为 PWA（manifest + service worker）

## 本地运行
```bash
pnpm install
pnpm dev
```

## 目录说明
- app/: 页面与布局
- public/: PWA 资源
- docs/101_local/: 本地评估文档（不进版本管理）
