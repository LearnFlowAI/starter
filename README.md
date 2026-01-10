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

## 贡献与本地质量关
- 初次进入 `starter` 仓库时，务必运行 `pnpm install`，该命令会安装依赖、触发 Husky `prepare` 钩子，并把 pre-commit/pre-push 挂载到本地仓库。
- 每次 `git commit` 前 `pnpm lint` 会自动运行，`git push` 前 Husky 会再跑一次 `pnpm test`（`vitest` 已固定使用 `--runInBand` 模式减少并发与资源抢占）。如果遇到钩子报错，先确认 `pnpm install` 已完成并使用与 `pnpm-lock.yaml` 兼容的 Node/Pnpm 版本。
- 后端质量门控也在 GitHub Actions 中复刻：`push`/`pull_request`（main）触发 `pnpm install && pnpm lint && pnpm test`，即便本地钩子未执行，CI 也能阻止未 lint/未测的提交合并。

## 目录说明
- app/: 页面与布局
- public/: PWA 资源
- docs/: 文档与说明（仅包含可开源内容）
