# Claude 中使用 Git 指南

## 前置条件

- Claude Code 已安装
- Git 已安装并完成 GitHub 绑定（用户名、邮箱、SSH Key）

## 基本用法

直接在对话中用自然语言告诉 Claude 你要做什么，它会执行对应的 git 命令。

### 克隆仓库

```
帮我 clone https://github.com/xxx/repo.git
```

或指定分支：

```
clone xxx/repo 的 dev 分支
```

### 提交代码

```
帮我提交代码，commit message 写"修复登录bug"
```

Claude 会：
1. 检查 `git status` 和 `git diff`
2. 确认变更内容
3. 执行 `git add` + `git commit`

### 查看状态

```
查看当前 git 状态
git log 最近5条
```

### 分支操作

```
创建分支 feature-login
切换到 main 分支
```

## 注意事项

- Claude 只会当你明确要求时才提交代码，不会擅自动作
- 创建 PR、force push 等操作前 Claude 会和你确认
- 如果 git hook（如 pre-commit）失败，Claude 会帮你排查

## 常用对话示例

| 你想做什么 | 怎么说 |
|-----------|--------|
| 查看改了什么 | "看看我改了哪些文件" |
| 提交所有改动 | "提交代码，message写xxx" |
| 回退某个文件 | "撤销 file.js 的改动" |
| 推送到远程 | "push 到 origin main" |
| 合并分支 | "把 dev 合并到 main" |
| 查看提交历史 | "最近10条 commit" |
