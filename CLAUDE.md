# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目定位

learnflow/starter 是一个可运行的 MVP 示例应用，演示 "计时 → 记录 → 积分 → 总览" 的学习记录闭环。这是一个 Next.js PWA 应用，支持离线使用，面向家庭和校园场景。

## 核心开发命令

```bash
# 安装依赖 (初次克隆必须执行)
pnpm install

# 开发服务器 (http://localhost:3000)
pnpm dev

# 生产构建
pnpm build
pnpm start

# 代码质量检查
pnpm lint         # Biome linting
pnpm format       # Biome formatting
pnpm typecheck    # TypeScript type checking

# 测试
pnpm test         # 运行所有测试
pnpm test:watch   # 监视模式 (推荐开发时使用)
```

## 测试驱动开发 (TDD)

**所有新功能必须采用 TDD 流程**：

1. 先写测试用例定义行为
2. 运行 `pnpm test:watch` 看到测试失败
3. 实现最小可行代码使测试通过
4. 重构优化代码
5. 确保所有测试通过后提交

### 运行单个测试

```bash
# 运行特定测试文件
pnpm test app/lib/__tests__/scoring.test.ts

# 监视模式下过滤测试
pnpm test:watch
# 然后按 'p' 过滤文件名, 按 't' 过滤测试名
```

### 测试文件位置

```
app/
├── lib/__tests__/           # lib 模块单元测试
│   ├── scoring.test.ts
│   ├── daily.test.ts
│   └── storage.test.ts
└── __tests__/               # 组件测试
    └── page.test.tsx
```

## 项目架构

### 核心数据流

```
1. Timer (计时) → 捕获学习时长 → SessionEntry
2. Record (记录) → 关联任务 + 填写反馈 → RecordEntry
3. Scoring (积分) → 根据规则计算分数 → points
4. Daily (汇总) → 聚合当日所有记录 → DailyAggregate
5. Overview (总览) → 展示历史趋势
```

### 目录结构

```
app/
├── lib/                    # 核心业务逻辑 (纯函数)
│   ├── models.ts          # TypeScript 类型定义
│   ├── storage.ts         # localStorage 封装
│   ├── scoring.ts         # 积分计算引擎
│   ├── daily.ts           # 每日数据聚合
│   └── defaults.ts        # 默认配置与常量
├── components/            # 共享 React 组件
│   └── TopNav.tsx        # 顶部导航
├── timer/                # 计时器页面
│   └── page.tsx
├── record/               # 记录页面
│   └── page.tsx
├── tasks/                # 任务管理页面
│   └── page.tsx
├── overview/             # 总览页面
│   └── page.tsx
├── globals.css           # 全局样式 + Tailwind
├── layout.tsx            # 根布局
└── page.tsx              # 首页
```

### 核心数据模型

```typescript
// 任务
Task {
  id: string
  title: string
  subject: string
  plannedMinutes: number
  status: "todo" | "doing" | "done"
}

// 学习记录
RecordEntry {
  id: string
  taskId: string
  minutes: number
  rating: number           // 1-5 评分
  mistakeCount: number
  writingStars: number     // 0-3 书写质量
  reviewChecked: boolean   // 复习
  fixChecked: boolean      // 订正
  previewChecked: boolean  // 预习
  points: number           // 计算得分
  createdAt: string
}

// 计时会话
SessionEntry {
  id: string
  taskId: string
  seconds: number
  pauseCount: number
  startedAt/endedAt: string
}
```

### 积分计算规则

实现在 `app/lib/scoring.ts`:

```typescript
基础分 = 时长分钟数
质量加成 = rating * 0.2  // 最高 +100%
惩罚 = mistakeCount * 0.05  // 每错一题 -5%
书写加成 = writingStars * 0.1  // 最高 +30%
习惯加成 = (复习 + 订正 + 预习) * 0.1  // 每项 +10%

最终得分 = 基础分 * (1 + 质量加成 - 惩罚 + 书写加成 + 习惯加成)
```

## Git Hooks 与质量门禁

项目使用 Husky 强制执行代码质量：

- **pre-commit**: 自动运行 `pnpm lint`
- **pre-push**: 自动运行 `pnpm test`

如果遇到 hook 错误：
1. 确认已运行 `pnpm install`
2. 检查 Node/pnpm 版本与 `pnpm-lock.yaml` 兼容
3. 查看 `.husky/` 目录下的 hook 脚本

## GitHub Actions CI

每次 push/pull_request 到 main 分支会自动运行：

```yaml
- pnpm install --frozen-lockfile
- pnpm lint
- pnpm test
```

即使本地 hook 未执行，CI 也能阻止不合规代码合并。

## 编码规范

### TypeScript

- 严格模式: `tsconfig.json` 启用 strict
- 类型导入: 使用 `import type` 导入类型
- 纯函数优先: `lib/` 中的逻辑尽量写成纯函数

### 样式

- Tailwind CSS: 使用 utility-first 方式
- 自定义类: 定义在 `globals.css` 中
- 设计令牌: 使用 CSS 变量 (如 `--moss`, `--ink`)

### 代码格式

Biome 配置 (`biome.json`):
- 2 空格缩进
- 推荐规则集
- 忽略 `.next/` 和 `node_modules/`

## 数据持久化

所有数据通过 `app/lib/storage.ts` 存储到 localStorage:

```typescript
// 读取
const tasks = storage.getTasks()

// 写入
storage.setTasks([...tasks, newTask])

// 数据键
TASKS_KEY = "learnflow_tasks"
RECORDS_KEY = "learnflow_records"
SESSIONS_KEY = "learnflow_sessions"
```

**注意**: localStorage 有 5-10MB 限制，适合 MVP。生产环境需要考虑 IndexedDB 或后端同步。

## PWA 支持

应用配置为 Progressive Web App:

- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **离线优先**: 核心功能可离线使用
- **安装提示**: 支持添加到主屏幕

## 常见开发任务

### 添加新页面

1. 在 `app/` 下创建新目录 (如 `analytics/`)
2. 创建 `page.tsx`
3. 使用 Next.js 文件系统路由 (自动生成 `/analytics`)

### 添加新的积分规则

1. 先写测试: `app/lib/__tests__/scoring.test.ts`
2. 修改 `app/lib/scoring.ts` 中的 `calculatePoints()`
3. 确保测试通过
4. 更新 `RecordEntry` 类型 (如需要)

### 添加新的数据模型

1. 在 `app/lib/models.ts` 定义 TypeScript 类型
2. 在 `app/lib/storage.ts` 添加存储方法
3. 编写单元测试验证存储逻辑

### 调试数据

打开浏览器开发者工具:
```javascript
// Console 中查看 localStorage
localStorage.getItem('learnflow_tasks')
localStorage.getItem('learnflow_records')

// 清空所有数据
localStorage.clear()
```

## 性能考虑

- **客户端渲染**: 所有页面都是客户端组件 (`use client`)
- **无服务端依赖**: 纯前端应用，适合 PWA
- **单线程测试**: Vitest 配置 `threads: false` 避免竞争
- **最小依赖**: 仅使用 Next.js 核心功能，无额外 UI 库

## 提交规范

建议使用 Conventional Commits:

```bash
feat(timer): 添加暂停功能
fix(scoring): 修复负数积分问题
test(daily): 添加边界条件测试
docs: 更新 README 安装说明
refactor(storage): 简化 localStorage 逻辑
```

## 技术栈版本

- **Next.js**: 14.2.5
- **React**: 18.3.1
- **TypeScript**: 5.5.4
- **Tailwind CSS**: 3.4.9
- **Biome**: 1.9.2
- **Vitest**: 2.1.9
- **pnpm**: 10.24.0+

## 已知限制

1. **数据容量**: localStorage 限制 5-10MB
2. **无后端**: 当前版本无服务端，无跨设备同步
3. **单用户**: 未实现多用户或权限系统
4. **简化积分**: 规则引擎较基础，未来可扩展

## 下一步开发方向

- [ ] 添加图表可视化 (趋势分析)
- [ ] 实现数据导出功能 (JSON/CSV)
- [ ] 添加每周/月报总结
- [ ] 支持自定义积分规则
- [ ] 集成后端 API (可选)

## 调试技巧

```bash
# 清空所有数据重新测试
localStorage.clear()
location.reload()

# 查看测试覆盖率
pnpm test -- --coverage

# 类型检查 + 构建 (完整验证)
pnpm typecheck && pnpm build
```

## 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vitest 文档](https://vitest.dev/)
- [Biome 文档](https://biomejs.dev/)
