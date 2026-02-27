# 自定义

OpenSpec 提供三个级别的自定义：

| 级别           | 功能                        | 最佳适用场景     |
| -------------- | --------------------------- | ---------------- |
| **项目配置**   | 设置默认值、注入上下文/规则 | 大多数团队       |
| **自定义模式** | 定义您自己的工作流工件      | 有独特流程的团队 |
| **全局覆盖**   | 在所有项目间共享模式        | 高级用户         |

---

## 项目配置

`openspec/config.yaml` 文件是为您的团队自定义 OpenSpec 的最简单方式。它允许您：

- **设置默认模式** — 在每个命令中省略 `--schema`
- **注入项目上下文** — AI 了解您的技术栈、约定等
- **添加每个工件的规则** — 针对特定工件的自定义规则

### 快速设置

```bash
openspec init
```

这将引导您以交互方式创建配置。或者手动创建一个：

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  技术栈：TypeScript、React、Node.js、PostgreSQL
  API 风格：RESTful，记录在 docs/api.md 中
  测试：Jest + React Testing Library
  我们重视所有公共 API 的向后兼容性

rules:
  proposal:
    - 包含回滚计划
    - 识别受影响的团队
  specs:
    - 使用 Given/When/Then 格式
    - 在发明新模式之前参考现有模式
```

### 工作原理

**默认模式：**

```bash
# 无配置
openspec new change my-feature --schema spec-driven

# 有配置 - 模式自动应用
openspec new change my-feature
```

**上下文和规则注入：**

生成任何工件时，您的上下文和规则都会被注入到 AI 提示中：

```xml
<context>
技术栈：TypeScript、React、Node.js、PostgreSQL
...
</context>

<rules>
- 包含回滚计划
- 识别受影响的团队
</rules>

<template>
[模式的内置模板]
</template>
```

- **上下文** 出现在所有工件中
- **规则** 仅出现在匹配的工件中

### 模式解析顺序

当 OpenSpec 需要模式时，它按以下顺序检查：

1. CLI 标志：`--schema <name>`
2. 变更元数据（变更文件夹中的 `.openspec.yaml`）
3. 项目配置（`openspec/config.yaml`）
4. 默认值（`spec-driven`）

---

## 自定义模式

当项目配置不够用时，创建具有完全自定义工作流的模式。自定义模式位于项目的 `openspec/schemas/` 目录中，并与代码一起进行版本控制。

```text
your-project/
├── openspec/
│   ├── config.yaml        # 项目配置
│   ├── schemas/           # 自定义模式存放在这里
│   │   └── my-workflow/
│   │       ├── schema.yaml
│   │       └── templates/
│   └── changes/           # 您的变更
└── src/
```

### 派生现有模式

自定义的最快方式是派生一个内置模式：

```bash
openspec schema fork spec-driven my-workflow
```

这将把整个 `spec-driven` 模式复制到 `openspec/schemas/my-workflow/`，您可以在那里自由编辑。

**您将获得：**

```text
openspec/schemas/my-workflow/
├── schema.yaml           # 工作流定义
└── templates/
    ├── proposal.md       # proposal 工件的模板
    ├── spec.md           # specs 的模板
    ├── design.md         # design 的模板
    └── tasks.md          # tasks 的模板
```

现在编辑 `schema.yaml` 来更改工作流，或编辑模板来更改 AI 生成的内容。

### 从头创建模式

要创建全新的工作流：

```bash
# 交互式
openspec schema init research-first

# 非交互式
openspec schema init rapid \
  --description "快速迭代工作流" \
  --artifacts "proposal,tasks" \
  --default
```

### 模式结构

模式定义了工作流中的工件以及它们之间的依赖关系：

```yaml
# openspec/schemas/my-workflow/schema.yaml
name: my-workflow
version: 1
description: 我团队的自定义工作流

artifacts:
  - id: proposal
    generates: proposal.md
    description: 初始提案文档
    template: proposal.md
    instruction: |
      创建一个解释为什么需要此变更的提案。
      关注问题，而不是解决方案。
    requires: []

  - id: design
    generates: design.md
    description: 技术设计
    template: design.md
    instruction: |
      创建解释如何实现的设计文档。
    requires:
      - proposal # 在 proposal 存在之前不能创建设计

  - id: tasks
    generates: tasks.md
    description: 实现清单
    template: tasks.md
    requires:
      - design

apply:
  requires: [tasks]
  tracks: tasks.md
```

**关键字段：**

| 字段          | 用途                                         |
| ------------- | -------------------------------------------- |
| `id`          | 唯一标识符，用于命令和规则                   |
| `generates`   | 输出文件名（支持通配符，如 `specs/**/*.md`） |
| `template`    | `templates/` 目录中的模板文件                |
| `instruction` | 用于创建此工件的 AI 指令                     |
| `requires`    | 依赖关系 — 必须先存在哪些工件                |

### 模板

模板是指导 AI 的 Markdown 文件。它们在创建工件时被注入到提示中。

```markdown
<!-- templates/proposal.md -->

## Why

<!-- 解释此变更的动机。这解决了什么问题？ -->

## What Changes

<!-- 描述将发生什么变化。具体说明新功能或修改。 -->

## Impact

<!-- 受影响的代码、API、依赖项、系统 -->
```

模板可以包含：

- AI 应填写的章节标题
- 带有 AI 指导的 HTML 注释
- 显示预期结构的示例格式

### 验证您的模式

在使用自定义模式之前，请验证它：

```bash
openspec schema validate my-workflow
```

这将检查：

- `schema.yaml` 语法是否正确
- 所有引用的模板都存在
- 没有循环依赖
- 工件 ID 有效

### 使用您的自定义模式

创建后，使用您的模式：

```bash
# 在命令中指定
openspec new change feature --schema my-workflow

# 或在 config.yaml 中设置为默认值
schema: my-workflow
```

### 调试模式解析

不确定正在使用哪个模式？使用以下命令检查：

```bash
# 查看特定模式从何处解析
openspec schema which my-workflow

# 列出所有可用模式
openspec schema which --all
```

输出显示它是来自您的项目、用户目录还是包：

```text
Schema: my-workflow
Source: project
Path: /path/to/project/openspec/schemas/my-workflow
```

---

> **注意：** OpenSpec 还支持用户级模式，位于 `~/.local/share/openspec/schemas/` 以便在项目间共享，但推荐使用项目级模式（位于 `openspec/schemas/`），因为它们与代码一起进行版本控制。

---

## 示例

### 快速迭代工作流

适用于快速迭代的最小工作流：

```yaml
# openspec/schemas/rapid/schema.yaml
name: rapid
version: 1
description: 最小开销的快速迭代

artifacts:
  - id: proposal
    generates: proposal.md
    description: 快速提案
    template: proposal.md
    instruction: |
      为此变更创建一个简短的提案。
      关注做什么和为什么，跳过详细规范。
    requires: []

  - id: tasks
    generates: tasks.md
    description: 实现清单
    template: tasks.md
    requires: [proposal]

apply:
  requires: [tasks]
  tracks: tasks.md
```

### 添加审查工件

派生默认模式并添加审查步骤：

```bash
openspec schema fork spec-driven with-review
```

然后编辑 `schema.yaml` 添加：

```yaml
- id: review
  generates: review.md
  description: 实现前审查清单
  template: review.md
  instruction: |
    基于设计创建审查清单。
    包括安全、性能和测试方面的考虑。
  requires:
    - design

- id: tasks
  # ... 现有的 tasks 配置 ...
  requires:
    - specs
    - design
    - review # 现在 tasks 也需要 review
```

---

## 另请参阅

- [CLI 参考：模式命令](cli.md#schema-commands) - 完整的命令文档
