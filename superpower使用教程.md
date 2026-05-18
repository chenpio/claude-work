# Superpowers 使用教程

## 是什么

Superpowers 是一套 Claude Code 开发流程插件，给 Claude 提供结构化的开发方法论。自动触发，你不需要手动调用。

## 已安装的 Skills 一览

### 流程类

| Skill | 何时触发 | 一句话说明 |
|-------|---------|-----------|
| **brainstorming** | 创建新功能、改行为之前 | 先理清需求和设计再动手 |
| **writing-plans** | 有了方案要写实施计划 | 把想法变成可执行的步骤清单 |
| **executing-plans** | 有了计划要执行 | 按计划逐步实现，有检查点验证 |
| **subagent-driven-development** | 计划里有多项独立任务 | 让多个 Agent 并行执行不同任务 |
| **dispatching-parallel-agents** | 面对 2 个以上无依赖的任务 | 分发任务给多个 Agent 同时跑 |
| **using-git-worktrees** | 需要隔离的开发环境 | 用 git worktree 在独立分支工作 |

### 质量类

| Skill | 何时触发 | 一句话说明 |
|-------|---------|-----------|
| **systematic-debugging** | 遇到 bug、测试失败 | 不要猜，按系统方法定位根因 |
| **test-driven-development** | 实现功能或修 bug 之前 | 先写测试再写代码 |
| **verification-before-completion** | 声称"完成了"之前 | 先跑验证命令，拿证据再说话 |
| **requesting-code-review** | 完成大功能、要合并前 | 请 Claude 做 code review |
| **receiving-code-review** | 收到 review 反馈 | 严谨处理每条 review 意见 |
| **simplify** | 有改动代码 | 检查代码是否有冗余、质量问题 |

### 项目类

| Skill | 何时触发 | 一句话说明 |
|-------|---------|-----------|
| **finishing-a-development-branch** | 代码写完、测试全通过 | 决定是合并还是 PR，帮你收尾 |
| **writing-skills** | 创建或修改 skill | 写新 skill 或改现有的 |

## 使用方式

### 方式一：自然语言触发（推荐）

直接跟我说你要做什么，我会自动走对应流程：

```
"帮我设计一个用户登录功能"       → brainstorming → writing-plans
"这个 bug 帮我看看"              → systematic-debugging → TDD
"写个批量导入 CSV 的功能"        → brainstorming → TDD → verification
"代码写完了，帮我收尾"           → verification → finishing-a-development-branch
"这几个功能帮我一起做"           → dispatching-parallel-agents
```

### 方式二：手动指定

你也可以直接让我用某个 skill：

```
/brainstorming    — 创意讨论，理清需求
/debug            — 系统化调试
/plan             — 写实施计划
/simplify         — 代码审查 + 简化
```

## 实际工作流示例

### 加一个新功能

```
你：加一个导出 PDF 的功能
我：→ brainstorming（搞清楚格式、触发方式、异常情况）
   → writing-plans（列出实现步骤和验证点）
   → TDD（先写测试）
   → 写代码
   → verification（跑测试确认）
   → 完成
```

### 修一个 bug

```
你：登录页面的验证码刷新不了
我：→ systematic-debugging（定位根因）
   → TDD（写复现测试）
   → 写修复代码
   → verification（确认测试通过）
   → 完成
```

### 多任务并行

```
你：帮我把 A、B、C 三个模块的重构一起做
我：→ dispatching-parallel-agents（拆成 3 个 Agent 并行执行）
   → 各自走 TDD + verification
   → 汇总结果
```

## Frontend Design 插件

独立的前端 UI 设计插件，和 Superpowers 互补。当你让我做网页、组件、页面时自动触发。

### 触发场景

```
"帮我做一个登录页面"               → frontend-design
"设计一个数据仪表盘"               → frontend-design
"把这个表单美化一下"               → frontend-design
```

### 效果

让生成的 UI 代码避免"AI 味审美"——不再千篇一律的蓝白配色、圆角按钮、Inter 字体。产出更有设计感、更独特的前端界面。

---

## 注意事项

- 你项目的 `CLAUDE.md`（用户指令）优先级高于 Superpowers 规则
- 如果 CLAUDE.md 说不要 TDD，我就不会强制走 TDD 流程
- 简单任务（修个拼写、改个配置）不会走完整流程，会自行判断
