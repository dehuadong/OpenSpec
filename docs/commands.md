# 命令

本文档是 OpenSpec 斜杠命令的参考。这些命令在您的 AI 编程助手的聊天界面中调用（例如 Claude Code、Cursor、Windsurf）。

有关工作流模式及何时使用各命令，请参阅[工作流](workflows.md)。有关 CLI 命令，请参阅 [CLI](cli.md)。

## 快速参考

### 默认快速路径（`core` 配置文件）

| 命令            | 用途                       |
| --------------- | -------------------------- |
| `/opsx:propose` | 创建变更并一步生成规划工件 |
| `/opsx:explore` | 在提交变更前思考想法       |
| `/opsx:apply`   | 实现变更中的任务           |
| `/opsx:archive` | 归档已完成的变更           |

### 扩展工作流命令（自定义工作流选择）

| 命令                 | 用途                         |
| -------------------- | ---------------------------- |
| `/opsx:new`          | 启动新的变更脚手架           |
| `/opsx:continue`     | 基于依赖关系创建下一个工件   |
| `/opsx:ff`           | 快进：一次性创建所有规划工件 |
| `/opsx:verify`       | 验证实现与工件匹配           |
| `/opsx:sync`         | 将增量规范合并到主规范       |
| `/opsx:bulk-archive` | 一次性归档多个变更           |
| `/opsx:onboard`      | 引导式教程，完成完整工作流   |

默认全局配置文件为 `core`。要启用扩展工作流命令，请运行 `openspec config profile`，选择工作流，然后在项目中运行 `openspec update`。

---

## 命令参考

### `/opsx:propose`

创建新变更并一步生成规划工件。这是 `core` 配置文件中的默认启动命令。

**语法：**

```text
/opsx:propose [change-name-or-description]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-name-or-description` | 否 | kebab-case 名称或纯语言变更描述 |

**功能：**

- 创建 `openspec/changes/<change-name>/`
- 生成实现前所需的工件（对于 `spec-driven`：proposal、specs、design、tasks）
- 在变更准备好进行 `/opsx:apply` 时停止

**示例：**

```text
您：/opsx:propose add-dark-mode

AI： 已创建 openspec/changes/add-dark-mode/
     ✓ proposal.md
     ✓ specs/ui/spec.md
     ✓ design.md
     ✓ tasks.md
     已准备好实现。运行 /opsx:apply。
```

**提示：**

- 使用此命令可获得最快的端到端路径
- 如果需要逐步控制工件，请启用扩展工作流并使用 `/opsx:new` + `/opsx:continue`

---

### `/opsx:explore`

在提交变更前思考想法、调查问题并澄清需求。

**语法：**

```
/opsx:explore [topic]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `topic` | 否 | 您想要探索或调查的内容 |

**功能：**

- 打开探索性对话，无需结构化要求
- 调查代码库以回答问题
- 比较选项和方法
- 创建可视化图表以理清思路
- 当见解清晰时可过渡到 `/opsx:propose`（默认）或 `/opsx:new`（扩展工作流）

**示例：**

```text
您：/opsx:explore

AI： 您想探索什么？

您：我们应该如何处理移动应用的身份验证？

AI： 让我调查一下您当前的身份验证设置...
     [分析代码库]

     我看到您为 Web 应用使用了基于会话的身份验证。
     对于移动端，我们有三个主要选项：

     1. JWT 令牌（无状态，支持离线工作）
     2. OAuth2（如果需要第三方登录）
     3. 扩展现有会话（更简单，但需要连接）

     您的 API 已配置 CORS。您对哪个方向感兴趣？

您：我们选择 JWT。我们可以为此启动一个变更吗？

AI： 随时可以。运行 /opsx:propose add-jwt-auth 开始。
```

**提示：**

- 当需求不明确或需要调查时使用
- 探索期间不会创建任何工件
- 适合在决定前比较多种方法
- 可以读取文件和搜索代码库

---

### `/opsx:new`

启动新的变更脚手架。创建变更文件夹，并等待您使用 `/opsx:continue` 或 `/opsx:ff` 生成工件。

此命令属于扩展工作流集（不包含在默认的 `core` 配置文件中）。

**语法：**

```
/opsx:new [change-name] [--schema <schema-name>]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 变更文件夹的名称（如果未提供则提示） |
| `--schema` | 否 | 要使用的工作流模式（默认：来自配置或 `spec-driven`） |

**功能：**

- 创建 `openspec/changes/<change-name>/` 目录
- 在变更文件夹中创建 `.openspec.yaml` 元数据文件
- 显示准备好创建的第一个工件模板
- 如果未提供则提示输入变更名称和模式

**创建的内容：**

```
openspec/changes/<change-name>/
└── .openspec.yaml    # 变更元数据（模式、创建日期）
```

**示例：**

```
您：/opsx:new add-dark-mode

AI： 已创建 openspec/changes/add-dark-mode/
     模式：spec-driven

     准备创建：proposal
     使用 /opsx:continue 创建，或使用 /opsx:ff 创建所有工件。
```

**提示：**

- 使用描述性名称：`add-feature`、`fix-bug`、`refactor-module`
- 避免使用通用名称如 `update`、`changes`、`wip`
- 模式也可以在项目配置中设置（`openspec/config.yaml`）

---

### `/opsx:continue`

在依赖链中创建下一个工件。一次创建一个工件，实现渐进式进度。

**语法：**

```
/opsx:continue [change-name]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要继续的变更（如果未提供则从上下文推断） |

**功能：**

- 查询工件依赖图
- 显示哪些工件已就绪、哪些被阻塞
- 创建第一个就绪的工件
- 读取依赖文件以获取上下文
- 显示创建后哪些工件变为可用

**示例：**

```
您：/opsx:continue

AI： 变更：add-dark-mode

     工件状态：
     ✓ proposal    （完成）
     ◆ specs       （就绪）
     ◆ design      （就绪）
     ○ tasks       （阻塞 - 需要：specs）

     正在创建 specs...

     [读取 proposal.md，根据需求创建 specs]

     ✓ 已创建 openspec/changes/add-dark-mode/specs/ui/spec.md

     现在可用：tasks
     运行 /opsx:continue 创建下一个工件。
```

**提示：**

- 当您想在继续之前审核每个工件时使用
- 适合需要控制的复杂变更
- 多个工件可能同时就绪
- 您可以在继续之前编辑已创建的工件

---

### `/opsx:ff`

快进完成工件创建。一次性创建所有规划工件。

**语法：**

```
/opsx:ff [change-name]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要快进的变更（如果未提供则从上下文推断） |

**功能：**

- 按依赖顺序创建所有工件
- 通过待办列表跟踪进度
- 在所有 `apply-required` 工件完成后停止
- 在创建下一个工件前读取每个依赖项

**示例：**

```
您：/opsx:ff add-dark-mode

AI： 正在快进 add-dark-mode...

     ✓ 创建 proposal.md
     ✓ 创建 specs/ui/spec.md
     ✓ 创建 design.md
     ✓ 创建 tasks.md

     所有规划工件已完成！
     已准备好实现。运行 /opsx:apply 开始。
```

**提示：**

- 当您对要构建的内容有清晰想法时使用
- 对于简单的变更比 `/opsx:continue` 更快
- 您之后仍然可以编辑工件
- 适合中小型功能

---

### `/opsx:apply`

实现变更中的任务。逐步完成任务列表，编写代码并勾选项目。

**语法：**

```
/opsx:apply [change-name]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要实现哪个变更（如果未提供则从上下文推断） |

**功能：**

- 读取 `tasks.md` 并识别未完成的任务
- 逐个完成任务
- 编写代码、创建文件、根据需要运行测试
- 使用复选框 `[x]` 标记任务完成

**示例：**

```
您：/opsx:apply

AI： 正在实现 add-dark-mode...

     读取 tasks.md：
     - [ ] 1.1 创建 ThemeContext
     - [ ] 1.2 添加 CSS 自定义属性
     - [ ] 1.3 实现 localStorage 持久化

     正在处理 1.1：创建 ThemeContext...
     [创建 src/context/ThemeContext.tsx]

     ✓ 1.1 完成

     正在处理 1.2：添加 CSS 自定义属性...
     [更新 src/styles/globals.css]

     ✓ 1.2 完成
     ...
```

**提示：**

- 如果中断，可以从上次停止的地方继续
- 通过指定变更名称用于并行变更
- 完成状态在 `tasks.md` 复选框中进行跟踪

---

### `/opsx:verify`

验证实现是否与变更工件匹配。检查完整性、正确性和一致性。

**语法：**

```
/opsx:verify [change-name]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要验证哪个变更（如果未提供则从上下文推断） |

**功能：**

- 检查实现质量的三个维度
- 在代码库中搜索实现证据
- 报告归类为 CRITICAL、WARNING 或 SUGGESTION 的问题
- 不会阻止归档，但会暴露问题

**验证维度：**

| 维度       | 验证内容                             |
| ---------- | ------------------------------------ |
| **完整性** | 所有任务完成，所有需求实现，覆盖场景 |
| **正确性** | 实现符合规范意图，处理边界情况       |
| **一致性** | 设计决策反映在代码中，模式一致       |

**示例：**

```
您：/opsx:verify

AI： 正在验证 add-dark-mode...

     完整性
     ✓ tasks.md 中所有 8 个任务均已勾选
     ✓ 规范中的所有需求都有对应的代码
     ⚠ 场景“系统偏好检测”没有测试覆盖

     正确性
     ✓ 实现符合规范意图
     ✓ 处理了场景中的边界情况
     ✓ 错误状态与规范定义匹配

     一致性
     ✓ 设计决策反映在代码结构中
     ✓ 命名约定与 design.md 一致
     ⚠ 设计提到“CSS 变量”但实现使用了 Tailwind 类

     摘要
     ─────────────────────────────
     严重问题：0
     警告：2
     准备归档：是（有警告）

     建议：
     1. 为系统偏好检测添加测试
     2. 更新 design.md 以反映 Tailwind 的使用，或重构为使用 CSS 变量
```

**提示：**

- 在归档前运行以尽早发现不匹配
- 警告不会阻止归档，但表示潜在问题
- 适合在提交前审核 AI 的工作
- 可以揭示工件与实现之间的偏差

---

### `/opsx:sync`

**可选命令。** 将变更中的增量规范合并到主规范。如果需要，归档会提示同步，因此通常不需要手动运行此命令。

**语法：**

```
/opsx:sync [change-name]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要同步哪个变更（如果未提供则从上下文推断） |

**功能：**

- 从变更文件夹读取增量规范
- 解析 ADDED/MODIFIED/REMOVED/RENAMED 部分
- 将更改合并到主 `openspec/specs/` 目录
- 保留增量中未提及的现有内容
- 不会归档变更（保持活跃状态）

**示例：**

```text
您：/opsx:sync

AI： 正在同步 add-dark-mode 增量规范...

     读取：openspec/changes/add-dark-mode/specs/ui/spec.md
     目标：openspec/specs/ui/spec.md

     要应用的更改：
     ✓ 添加：主题选择需求（2 个场景）
     ✓ 添加：可访问性需求（1 个场景）

     正在合并...
     ✓ openspec/specs/ui/spec.md 已更新

     变更保持活跃。准备完成时运行 /opsx:archive。
```

**何时手动使用：**

| 场景                                 | 是否使用 sync？  |
| ------------------------------------ | ---------------- |
| 长期变更，想在归档前将规范放入主规范 | 是               |
| 多个并行变更需要更新后的基础规范     | 是               |
| 想要单独预览/审核合并                | 是               |
| 快速变更，直接归档                   | 否（归档会处理） |

**提示：**

- Sync 是智能的，不是简单的复制粘贴
- 可以向现有需求添加场景而不会重复
- 同步后变更保持活跃（未归档）
- 大多数用户永远不需要直接调用此命令——归档会在需要时提示

---

### `/opsx:archive`

归档已完成的变更。完成变更并将其移至归档文件夹。

**语法：**

```
/opsx:archive [change-name]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-name` | 否 | 要归档哪个变更（如果未提供则从上下文推断） |

**功能：**

- 检查工件完成状态
- 检查任务完成情况（未完成时警告）
- 如果尚未同步，提供同步增量规范的选项
- 将变更文件夹移至 `openspec/changes/archive/YYYY-MM-DD-<name>/`
- 保留所有工件以供审计

**示例：**

```text
您：/opsx:archive

AI： 正在归档 add-dark-mode...

     工件状态：
     ✓ proposal.md 存在
     ✓ specs/ 存在
     ✓ design.md 存在
     ✓ tasks.md 存在（8/8 任务完成）

     增量规范：尚未同步
     → 现在同步？（推荐）

您：是

AI： ✓ 已同步规范至 openspec/specs/ui/spec.md
     ✓ 已移至 openspec/changes/archive/2025-01-24-add-dark-mode/

     变更归档成功。
```

**提示：**

- 归档不会因任务未完成而阻止，但会发出警告
- 增量规范可以在归档期间或之前同步
- 归档的变更会保留以供历史追溯
- 先使用 `/opsx:verify` 来发现问题

---

### `/opsx:bulk-archive`

一次性归档多个已完成的变更。处理变更之间的规范冲突。

**语法：**

```
/opsx:bulk-archive [change-names...]
```

**参数：**
| 参数 | 是否必需 | 描述 |
|----------|----------|-------------|
| `change-names` | 否 | 要归档的特定变更（如果未提供则提示选择） |

**功能：**

- 列出所有已完成的变更
- 归档前验证每个变更
- 检测跨变更的规范冲突
- 通过检查实际实现来解决冲突
- 按时间顺序归档

**示例：**

```
您：/opsx:bulk-archive

AI： 找到 3 个已完成的变更：
     - add-dark-mode（8/8 任务完成）
     - fix-login-bug（3/3 任务完成）
     - update-footer（2/2 任务完成）

     检查规范冲突...
     ⚠ add-dark-mode 和 update-footer 都涉及 specs/ui/

     检查代码库以解决...
     两个变更都已实现。将按时间顺序合并：
     1. add-dark-mode（创建于 Jan 20）
     2. update-footer（创建于 Jan 22）

     归档所有 3 个变更？

您：是

AI： ✓ 已归档 add-dark-mode
     ✓ 已归档 fix-login-bug
     ✓ 已归档 update-footer
     规范已合并：add-dark-mode → update-footer
```

**提示：**

- 适合并行工作流
- 冲突解决是代理式的（检查代码库）
- 变更按创建顺序归档
- 覆盖规范内容前会提示

---

### `/opsx:onboard`

通过完整 OpenSpec 工作流的引导式入门。使用您实际代码库的交互式教程。

**语法：**

```
/opsx:onboard
```

**功能：**

- 带讲解逐步完成完整的工作流周期
- 扫描您的代码库以寻找真实的改进机会
- 创建带有真实工件的实际变更
- 实现实际工作（小型、安全的变更）
- 归档已完成的变更
- 在每一步进行解释

**阶段：**

1. 欢迎和代码库分析
2. 寻找改进机会
3. 创建变更（`/opsx:new`）
4. 编写提案
5. 创建规范
6. 编写设计
7. 创建任务
8. 实现任务（`/opsx:apply`）
9. 验证实现
10. 归档变更
11. 总结和后续步骤

**示例：**

```
您：/opsx:onboard

AI： 欢迎使用 OpenSpec！

     我将使用您实际的代码库带您完成完整的工作流。
     我们会找到一些小的改进点，为其创建合适的变更，
     实现它，并归档。

     让我扫描您的代码库以寻找机会...

     [分析代码库]

     我发现了一些我们可以处理的内容：
     1. 为联系表单添加输入验证
     2. 改进身份验证流程中的错误消息
     3. 为异步按钮添加加载状态

     您对哪个感兴趣？（或者建议其他内容）
```

**提示：**

- 最适合新用户学习工作流
- 使用真实代码，而非示例
- 创建您可以保留或丢弃的真实变更
- 需要 15-30 分钟完成

---

## 按 AI 工具分类的命令语法

不同的 AI 工具使用略有不同的命令语法。使用与您的工具匹配的格式：

| 工具          | 语法示例                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Claude Code   | `/opsx:propose`、`/opsx:apply`                                                                 |
| Cursor        | `/opsx-propose`、`/opsx-apply`                                                                 |
| Windsurf      | `/opsx-propose`、`/opsx-apply`                                                                 |
| Copilot (IDE) | `/opsx-propose`、`/opsx-apply`                                                                 |
| Trae          | 基于技能的调用，如 `/openspec-propose`、`/openspec-apply-change`（无生成的 `opsx-*` 命令文件） |

意图在所有工具中相同，但命令的呈现方式因集成而异。

> **注意：** GitHub Copilot 命令（`.github/prompts/*.prompt.md`）仅在 IDE 扩展（VS Code、JetBrains、Visual Studio）中可用。GitHub Copilot CLI 目前不支持自定义提示文件 — 详见[支持的工具](supported-tools.md)了解详情和替代方案。

---

## 遗留命令

这些命令使用较旧的“一步到位”工作流。它们仍然可用，但推荐使用 OPSX 命令。

| 命令                 | 功能                                                 |
| -------------------- | ---------------------------------------------------- |
| `/openspec:proposal` | 一次性创建所有工件（proposal、specs、design、tasks） |
| `/openspec:apply`    | 实现变更                                             |
| `/openspec:archive`  | 归档变更                                             |

**何时使用遗留命令：**

- 使用旧工作流的现有项目
- 不需要增量工件创建的简单变更
- 偏好全有或全无的方式

**迁移到 OPSX：**
遗留变更可以继续使用 OPSX 命令。工件结构是兼容的。

---

## 故障排除

### "Change not found"（未找到变更）

命令无法识别要处理的变更。

**解决方案：**

- 显式指定变更名称：`/opsx:apply add-dark-mode`
- 检查变更文件夹是否存在：`openspec list`
- 确认您在正确的项目目录中

### "No artifacts ready"（没有工件就绪）

所有工件要么已完成，要么因缺少依赖而被阻塞。

**解决方案：**

- 运行 `openspec status --change <name>` 查看阻塞原因
- 检查所需的工件是否存在
- 先创建缺失的依赖工件

### "Schema not found"（未找到模式）

指定的模式不存在。

**解决方案：**

- 列出可用模式：`openspec schemas`
- 检查模式名称的拼写
- 如果是自定义模式，创建它：`openspec schema init <name>`

### Commands not recognized（命令无法识别）

AI 工具无法识别 OpenSpec 命令。

**解决方案：**

- 确保 OpenSpec 已初始化：`openspec init`
- 重新生成技能：`openspec update`
- 检查 `.claude/skills/` 目录是否存在（对于 Claude Code）
- 重启 AI 工具以加载新技能

### Artifacts not generating properly（工件生成不正确）

AI 创建不完整或不正确的工件。

**解决方案：**

- 在 `openspec/config.yaml` 中添加项目上下文
- 为特定指导添加每个工件的规则
- 在变更描述中提供更多细节
- 使用 `/opsx:continue` 而不是 `/opsx:ff` 以获得更多控制

---

## 后续步骤

- [工作流](workflows.md) - 常见模式及何时使用各命令
- [CLI](cli.md) - 用于管理和验证的终端命令
- [自定义](customization.md) - 创建自定义模式和工作流
