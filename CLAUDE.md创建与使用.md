# 项目级 CLAUDE.md 创建与使用

## 是什么

`CLAUDE.md` 是放在项目根目录的一个文件，给 Claude Code 提供项目上下文——告诉 Claude 这个项目怎么构建、怎么测试、代码结构是怎样的。每次启动会话时 Claude 会自动读取。

## 创建方式

### 方式一：手动创建

直接在项目根目录新建 `CLAUDE.md`，按你的需要写。

### 方式二：用 /init 命令

在 Claude Code 对话中输入：

```
/init
```

Claude 会扫描整个项目自动生成 CLAUDE.md，内容包括：
- 构建/测试命令
- 代码架构概览
- 关键约定

> **前提**：项目里需要有代码，空仓库生成不了有意义的内容。

## 放哪里

```
my-project/
├── CLAUDE.md          ← 放这里（项目根目录）
├── .claude/
│   └── settings.json
├── src/
└── ...
```

## 写什么

重点写让 Claude 快速上手的信息，不要写显而易见的：

| 推荐写 | 不建议写 |
|--------|----------|
| 构建命令（`npm run build`） | "提供友好的错误提示" |
| 测试命令（`pytest tests/`） | "遵循代码规范" |
| 架构说明（"API 层调用 Service 层"） | 每行都写注释 |
| 特殊约定（"不要用 lodash"） | 通用开发实践 |

### 一个实际例子

```markdown
# CLAUDE.md

## 构建与测试
- 安装依赖: `pnpm install`
- 构建: `pnpm build`
- 全部测试: `pnpm test`
- 单个测试: `pnpm test -- -t "test name"`
- Lint: `pnpm lint`

## 架构
- `src/api/` - REST 接口层，只做参数校验和响应格式化
- `src/services/` - 业务逻辑，所有数据库操作必须经过这里
- `src/db/` - 数据库访问层，使用 Prisma ORM

## 约定
- 禁止在 `api/` 层直接操作数据库
- 日期统一用 dayjs，不要用 moment
```

## 如何使用

写完 `CLAUDE.md` 后不需要做任何操作。下次和 Claude Code 对话时，它会自动加载这个文件作为上下文。

你可以随时用 `/init` 刷新它，或者手动编辑后 Claude 下次会话自动生效。

## CLAUDE.md vs .claude/settings.json

| | CLAUDE.md | settings.json |
|------|-----------|---------------|
| 作用 | 给 Claude 看的"项目说明书" | 控制 Claude Code 的行为 |
| 内容 | 构建命令、架构、约定 | 权限、hooks、模型选择 |
| 格式 | Markdown | JSON |
