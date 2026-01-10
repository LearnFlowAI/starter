---
评审编号: 001
评审对象: starter/ Husky 提交流程
评审日期: 2026-01-10
评审人: Codex
前置评审: 无
---

## 1. 问题
- [x] **缺少服务端质量关**（starter/.husky/pre-push:3）
  - 说明：钩子把 `pnpm lint` 固定在 pre-commit、`pnpm test` 固定在 pre-push，衡量本地提交/推送的质量，但现有仓库尚未在 CI（如 GitHub Actions）中复刻这一标准，任何绕过 hook 的提交都能将未 lint/未测试 的代码推送。
  - 建议：让 push/pr 触发一个 `pnpm lint && pnpm test` 的 job，以便服务器也能捕获未校验的变更。
  - 解决：新增 `starter/.github/workflows/ci.yml`，在 main 分支的 push/pull_request 时依次执行 `pnpm install --frozen-lockfile`、`pnpm lint`、`pnpm test`，和 Husky 钩子形成一致的质量门控。

- [x] **预推送钩子对首次贡献者未作提示**（starter/.husky/pre-push:3）
  - 说明：`pnpm test` 在 pre-push 本地执行，而 Vitest 依赖必须先通过 `pnpm install`、Node/Pnpm 版本兼容等条件。没有提示，新贡献者容易在未安装依赖或用错版本的情况下直接推送，卡在钩子错误。
  - 建议：文档中说明“首次进入仓库需先运行 `pnpm install`，并解释 pre-commit lint/pre-push test 的行为”。
  - 解决：README “贡献与本地质量关”新增章节，说明 `pnpm install` 触发 Husky、钩子的执行时机、遇到失败的排查顺序，以及CI也会再跑一次 lint/test。

- [x] **完成记录时追加不能抗并发**（app/record/page.tsx:235-259）
  - 说明：`setRecords([entry, ...records])` 读取闭包中的 `records`，若用户在极短时间内重复点击或其他逻辑同时写入，会导致后续更新仍基于旧状态而覆盖前一条记录。
  - 建议：改用功能型 updater `setRecords((prev) => [entry, ...prev])`，避免状态覆盖和丢记录。
  - 解决：`RecordPage` 中 `setRecords` 已改为此 UPD 格式。

- [x] **任务表单的计划分钟缺少校验**（app/tasks/page.tsx:57-99）
  - 说明：分钟输入直接 `Number(event.target.value)`，空值/非数值会变成 `0` 或 `NaN`，可能保存出不合理的 `plannedMinutes`，后续 `record` 逻辑在展示分钟或积分时出现异常。
  - 建议：保存前 normalize 分钟（最小 5、向上取整、跳过非法输入），确保 downstream 总是拿到正整数。
  - 解决：新增 `normalizeMinutes` 辅助；保存/编辑任务时都用其结果，`plannedMinutes` 永远合法。

## 2. 开放问题
- [ ] 是否需要在 README 里进一步归纳常见钩子失败信息（如依赖未安装、Node 版本不符）以减少新贡献者卡壳？
- [ ] 是否应在其他文档/流程里明确 Node/PNPM 版本（或提供 `.nvmrc`/`.npmrc`），辅助外部贡献者快速匹配环境？

## 3. 变更概述
- 引入 Husky 的 `pre-commit`/`pre-push` 保障本地 lint/test 执行，并新增 `prepare` 以自动安装钩子。
- 新添 `.github/workflows/ci.yml`，在 push 或 PR 时复刻 `pnpm lint` + `pnpm test`，形成服务端质量门。
- README “贡献与本地质量关” 讲清楚 `pnpm install` 的作用、钩子执行顺序、以及 CI 保障。
- `RecordPage` 与 `TasksPage` 的关键操作已在代码层面修复，并加入 normalize 工具以确保字段稳定。

## 4. 建议的下一步
- [x] 在 CI 中跑 `pnpm lint && pnpm test`（已完）。
- [x] 补充文档/钩子提示（已完）。
- [x] 为 `pnpm test` 增加 `--runInBand`（已完，脚本已更新到 `package.json`）。
