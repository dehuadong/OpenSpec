# 迁移到 OPSX

本指南帮助您从旧的 OpenSpec 工作流过渡到 OPSX。迁移过程设计得平滑流畅——您现有的工作将被保留，新系统提供了更多的灵活性。

## 有哪些变化？

OPSX 用灵活的、基于操作的方法取代了旧的阶段锁定工作流。以下是关键转变：

| 方面       | 旧版                                                         | OPSX                                                                        |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **命令**   | `/openspec:proposal`、`/openspec:apply`、`/openspec:archive` | 默认：`/opsx:propose`、`/opsx:apply`、`/opsx:archive`（扩展工作流命令可选） |
| **工作流** | 一次性创建所有工件                                           | 增量创建或一次性创建——由您选择                                              |
| **回溯**   | 笨拙的阶段关卡                                               | 自然——随时更新任何工件                                                      |
| **自定义** | 固定结构                                                     | 模式驱动，完全可定制                                                        |
| **配置**   | 带标记的 `CLAUDE.md` + `project.md`                          | `openspec/config.yaml` 中的简洁配置                                         |

**理念的变化：** 工作不是线性的。OPSX 不再假装它是线性的。

---

## 开始之前

### 您现有的工作是安全的

迁移过程的设计以保留为前提：

- **`openspec/changes/` 中的活跃变更** — 完全保留。您可以继续使用 OPSX 命令处理它们。
- **已归档的变更** — 不受影响。您的历史记录保持完整。
- **`openspec/specs/` 中的主规范** — 不受影响。这些是您的真实来源。
- **您在 CLAUDE.md、AGENTS.md 等内容** — 保留。只有 OpenSpec 标记块被移除；您编写的所有内容都保留。

### 会被移除的内容

只有被替换的 OpenSpec 管理的文件会被移除：

| 内容                                              | 原因               |
| ------------------------------------------------- | ------------------ |
| 旧的斜杠命令目录/文件                             | 被新的技能系统取代 |
| `openspec/AGENTS.md`                              | 过时的工作流触发器 |
| `CLAUDE.md`、`AGENTS.md` 等文件中的 OpenSpec 标记 | 不再需要           |

**按工具分类的旧命令位置**（示例——您的工具可能有所不同）：

- Claude Code：`.claude/commands/openspec/`
- Cursor：`.cursor/commands/openspec-*.md`
- Windsurf：`.windsurf/workflows/openspec-*.md`
- Cline：`.clinerules/workflows/openspec-*.md`
- Roo：`.roo/commands/openspec-*.md`
- GitHub Copilot：`.github/prompts/openspec-*.prompt.md`（仅限 IDE 扩展；Copilot CLI 不支持）
- 以及其他工具（Augment、Continue、Amazon Q 等）

迁移会检测您已配置的任何工具，并清理它们的旧文件。

移除列表可能看起来很冗长，但这些都是 OpenSpec 最初创建的文件。您自己的内容永远不会被删除。

### 需要您关注的内容

有一个文件需要手动迁移：

**`openspec/project.md`** — 此文件不会自动删除，因为它可能包含您编写的项目上下文。您需要：

1. 查看其内容
2. 将有价值的上下文移动到 `openspec/config.yaml`（参见下面的指导）
3. 准备就绪后删除该文件

**为什么我们做了这个更改：**

旧的 `project.md` 是被动的——代理可能会读取它，也可能不会，或者可能忘记读取的内容。我们发现可靠性不一致。

新的 `config.yaml` 上下文**被主动注入到每个 OpenSpec 规划请求中**。这意味着当 AI 创建工件时，您的项目约定、技术栈和规则始终存在。可靠性更高。

**权衡：**

因为上下文被注入到每个请求中，您需要保持简洁。关注真正重要的内容：

- 技术栈和关键约定
- AI 需要知道的非显而易见约束
- 之前经常被忽略的规则

不必担心做到完美。我们仍在探索什么方式效果最好，并将在实践中改进上下文注入的工作方式。

---

## 运行迁移

`openspec init` 和 `openspec update` 都会检测旧文件并引导您完成相同的清理过程。使用适合您情况的方式：

- 新安装默认为 `core` 配置文件（`propose`、`explore`、`apply`、`archive`）。
- 迁移的安装通过在需要时写入 `custom` 配置文件来保留您之前安装的工作流。

### 使用 `openspec init`

如果您想添加新工具或重新配置已设置的工具，请运行此命令：

```bash
openspec init
```

init 命令会检测旧文件并引导您完成清理：

```
Upgrading to the new OpenSpec

OpenSpec now uses agent skills, the emerging standard across coding
agents. This simplifies your setup while keeping everything working
as before.

Files to remove
No user content to preserve:
  • .claude/commands/openspec/
  • openspec/AGENTS.md

Files to update
OpenSpec markers will be removed, your content preserved:
  • CLAUDE.md
  • AGENTS.md

Needs your attention
  • openspec/project.md
    We won't delete this file. It may contain useful project context.

    The new openspec/config.yaml has a "context:" section for planning
    context. This is included in every OpenSpec request and works more
    reliably than the old project.md approach.

    Review project.md, move any useful content to config.yaml's context
    section, then delete the file when ready.

? Upgrade and clean up legacy files? (Y/n)
```

**当您选择“是”时会发生什么：**

1. 旧的斜杠命令目录被移除
2. OpenSpec 标记从 `CLAUDE.md`、`AGENTS.md` 等文件中剥离（您的内容保留）
3. `openspec/AGENTS.md` 被删除
4. 新技能被安装到 `.claude/skills/`
5. `openspec/config.yaml` 使用默认模式创建

### 使用 `openspec update`

如果您只想迁移并将现有工具刷新到最新版本，请运行此命令：

```bash
openspec update
```

update 命令也会检测并清理旧工件，然后刷新生成的技能/命令以匹配您当前的配置文件设置。

### 非交互式 / CI 环境

对于脚本化迁移：

```bash
openspec init --force --tools claude
```

`--force` 标志会跳过提示并自动接受清理。

---

## 将 project.md 迁移到 config.yaml

旧的 `openspec/project.md` 是一个用于项目上下文的自由格式 Markdown 文件。新的 `openspec/config.yaml` 是结构化的，并且关键的是——**被注入到每个规划请求中**，这样当 AI 工作时，您的约定始终存在。

### 之前（project.md）

```markdown
# Project Context

这是一个使用 React 和 Node.js 的 TypeScript 单体仓库。
我们使用 Jest 进行测试，并遵循严格的 ESLint 规则。
我们的 API 是 RESTful 的，记录在 docs/api.md 中。

## Conventions

- 所有公共 API 必须保持向后兼容
- 新功能应包含测试
- 规范使用 Given/When/Then 格式
```

### 之后（config.yaml）

```yaml
schema: spec-driven

context: |
  技术栈：TypeScript、React、Node.js
  测试：Jest with React Testing Library
  API：RESTful，记录在 docs/api.md 中
  我们保持所有公共 API 的向后兼容性

rules:
  proposal:
    - 对风险变更包含回滚计划
  specs:
    - 场景使用 Given/When/Then 格式
    - 在发明新模式之前参考现有模式
  design:
    - 复杂流程包含序列图
```

### 关键区别

| project.md        | config.yaml                                      |
| ----------------- | ------------------------------------------------ |
| 自由格式 Markdown | 结构化 YAML                                      |
| 单一文本块        | 独立的上下文和每个工件的规则                     |
| 使用时机不明确    | 上下文出现在所有工件中；规则仅出现在匹配的工件中 |
| 无模式选择        | 显式 `schema:` 字段设置默认工作流                |

### 保留什么，舍弃什么

迁移时要有选择性。问自己：“AI 在*每个*规划请求中都需要这个吗？”

**适合放入 `context:` 的内容：**

- 技术栈（语言、框架、数据库）
- 关键架构模式（单体仓库、微服务等）
- 非显而易见的约束（“我们不能使用库 X，因为……”）
- 经常被忽略的关键约定

**改为放入 `rules:` 的内容：**

- 工件特定的格式（“在规范中使用 Given/When/Then”）
- 审查标准（“提案必须包含回滚计划”）
- 这些只出现在匹配的工件中，使其他请求更轻量

**完全省略的内容：**

- AI 已经知道的一般最佳实践
- 可以概括的冗长解释
- 不影响当前工作的历史上下文

### 迁移步骤

1. **创建 config.yaml**（如果 init 没有创建）：

   ```yaml
   schema: spec-driven
   ```

2. **添加上下文**（保持简洁——这会进入每个请求）：

   ```yaml
   context: |
     您的项目背景放在这里。
     关注 AI 真正需要知道的内容。
   ```

3. **添加每个工件的规则**（可选）：

   ```yaml
   rules:
     proposal:
       - 您提案特定的指导
     specs:
       - 您规范编写的规则
   ```

4. **删除 project.md**，当您已经移动了所有有用的内容之后。

**不要过度思考。** 从基本要素开始，然后迭代。如果您注意到 AI 遗漏了重要的内容，就添加它。如果上下文感觉臃肿，就精简它。这是一个活文档。

### 需要帮助？使用这个提示词

如果您不确定如何提炼您的 project.md，可以询问您的 AI 助手：

```
我正在将 OpenSpec 旧的 project.md 迁移到新的 config.yaml 格式。

这是我当前的 project.md：
[粘贴您的 project.md 内容]

请帮助我创建一个 config.yaml，包含：
1. 简洁的 `context:` 部分（这会注入到每个规划请求中，所以保持紧凑——关注技术栈、关键约束和经常被忽略的约定）
2. 如果任何内容是工件特定的（例如，“使用 Given/When/Then”属于规范规则，而不是全局上下文），则为特定工件添加 `rules:`

省略任何 AI 模型已经知道的通用内容。大胆追求简洁。
```

AI 会帮助您识别什么是必要的，什么可以精简。

---

## 新命令

命令的可用性取决于配置文件：

**默认（`core` 配置文件）：**

| 命令            | 用途                       |
| --------------- | -------------------------- |
| `/opsx:propose` | 创建变更并一步生成规划工件 |
| `/opsx:explore` | 无结构地思考想法           |
| `/opsx:apply`   | 实现 tasks.md 中的任务     |
| `/opsx:archive` | 完成并归档变更             |

**扩展工作流（自定义选择）：**

| 命令                 | 用途                       |
| -------------------- | -------------------------- |
| `/opsx:new`          | 启动新的变更脚手架         |
| `/opsx:continue`     | 创建下一个工件（每次一个） |
| `/opsx:ff`           | 快进——一次性创建规划工件   |
| `/opsx:verify`       | 验证实现与规范匹配         |
| `/opsx:sync`         | 预览/规范合并而不归档      |
| `/opsx:bulk-archive` | 一次性归档多个变更         |
| `/opsx:onboard`      | 引导式端到端入门工作流     |

使用 `openspec config profile` 启用扩展命令，然后运行 `openspec update`。

### 从旧版命令映射

| 旧版                 | OPSX 对应                                                     |
| -------------------- | ------------------------------------------------------------- |
| `/openspec:proposal` | `/opsx:propose`（默认）或 `/opsx:new` 然后 `/opsx:ff`（扩展） |
| `/openspec:apply`    | `/opsx:apply`                                                 |
| `/openspec:archive`  | `/opsx:archive`                                               |

### 新能力

这些能力是扩展工作流命令集的一部分。

**细粒度工件创建：**

```
/opsx:continue
```

基于依赖关系一次创建一个工件。当您想审查每一步时使用此命令。

**探索模式：**

```
/opsx:explore
```

在提交变更之前与搭档一起思考想法。

---

## 理解新架构

### 从阶段锁定到灵活

旧工作流强制线性推进：

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   规划阶段    │ ───► │   实现阶段    │ ───► │   归档阶段    │
└──────────────┘      └──────────────┘      └──────────────┘

如果您在实现过程中意识到设计是错误的？
糟糕。阶段关卡让您难以轻松回溯。
```

OPSX 使用操作，而不是阶段：

```
         ┌───────────────────────────────────────────────┐
         │           操作（而非阶段）                      │
         │                                               │
         │     new ◄──► continue ◄──► apply ◄──► archive │
         │      │          │           │             │   │
         │      └──────────┴───────────┴─────────────┘   │
         │                    任意顺序                    │
         └───────────────────────────────────────────────┘
```

### 依赖图

工件形成有向图。依赖关系是启用器，而不是关卡：

```
                        proposal
                       （根节点）
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
           specs                       design
        （需要：                      （需要：
         proposal）                    proposal）
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                         tasks
                     （需要：
                     specs、design）
```

当您运行 `/opsx:continue` 时，它会检查哪些已就绪并提供下一个工件。您也可以以任何顺序创建多个就绪工件。

### 技能 vs 命令

旧系统使用特定于工具的命令文件：

```
.claude/commands/openspec/
├── proposal.md
├── apply.md
└── archive.md
```

OPSX 使用新兴的**技能**标准：

```
.claude/skills/
├── openspec-explore/SKILL.md
├── openspec-new-change/SKILL.md
├── openspec-continue-change/SKILL.md
├── openspec-apply-change/SKILL.md
└── ...
```

技能在多个 AI 编码工具中被识别，并提供更丰富的元数据。

---

## 继续现有变更

您进行中的变更可以与 OPSX 命令无缝协作。

**有来自旧工作流的活跃变更？**

```
/opsx:apply add-my-feature
```

OPSX 读取现有工件并从您停止的地方继续。

**想向现有变更添加更多工件？**

```
/opsx:continue add-my-feature
```

根据已存在的内容显示哪些已就绪可以创建。

**需要查看状态？**

```bash
openspec status --change add-my-feature
```

---

## 新配置系统

### config.yaml 结构

```yaml
# 必需：新变更的默认模式
schema: spec-driven

# 可选：项目上下文（最大 50KB）
# 注入到所有工件指令中
context: |
  您的项目背景、技术栈、
  约定和约束。

# 可选：每个工件的规则
# 仅注入到匹配的工件中
rules:
  proposal:
    - 包含回滚计划
  specs:
    - 使用 Given/When/Then 格式
  design:
    - 记录降级策略
  tasks:
    - 拆分为最多 2 小时的任务块
```

### 模式解析

当确定使用哪个模式时，OPSX 按顺序检查：

1. **CLI 标志**：`--schema <name>`（最高优先级）
2. **变更元数据**：变更目录中的 `.openspec.yaml`
3. **项目配置**：`openspec/config.yaml`
4. **默认**：`spec-driven`

### 可用模式

| 模式          | 工件                              | 最佳适用场景 |
| ------------- | --------------------------------- | ------------ |
| `spec-driven` | proposal → specs → design → tasks | 大多数项目   |

列出所有可用模式：

```bash
openspec schemas
```

### 自定义模式

创建您自己的工作流：

```bash
openspec schema init my-workflow
```

或派生现有模式：

```bash
openspec schema fork spec-driven my-workflow
```

详情请参阅[自定义](customization.md)。

---

## 故障排除

### "Legacy files detected in non-interactive mode"（在非交互模式下检测到旧文件）

您在 CI 或非交互环境中运行。使用：

```bash
openspec init --force
```

### 迁移后命令未出现

重启您的 IDE。技能在启动时被检测。

### "Unknown artifact ID in rules"（规则中存在未知工件 ID）

检查您的 `rules:` 键是否与您模式的工件 ID 匹配：

- **spec-driven**：`proposal`、`specs`、`design`、`tasks`

运行此命令查看有效的工件 ID：

```bash
openspec schemas --json
```

### 配置未生效

1. 确保文件位于 `openspec/config.yaml`（不是 `.yml`）
2. 验证 YAML 语法
3. 配置更改立即生效——无需重启

### project.md 未迁移

系统有意保留 `project.md`，因为它可能包含您的自定义内容。手动审查它，将有用部分移动到 `config.yaml`，然后删除它。

### 想查看哪些内容会被清理？

运行 init 并拒绝清理提示——您将看到完整的检测摘要，而不会进行任何更改。

---

## 快速参考

### 迁移后的文件

```
project/
├── openspec/
│   ├── specs/                    # 未更改
│   ├── changes/                  # 未更改
│   │   └── archive/              # 未更改
│   └── config.yaml               # 新增：项目配置
├── .claude/
│   └── skills/                   # 新增：OPSX 技能
│       ├── openspec-propose/     # 默认 core 配置文件
│       ├── openspec-explore/
│       ├── openspec-apply-change/
│       └── ...                   # 扩展配置文件添加 new/continue/ff 等
├── CLAUDE.md                     # OpenSpec 标记已移除，您的内容保留
└── AGENTS.md                     # OpenSpec 标记已移除，您的内容保留
```

### 已移除的内容

- `.claude/commands/openspec/` — 被 `.claude/skills/` 取代
- `openspec/AGENTS.md` — 过时
- `openspec/project.md` — 迁移到 `config.yaml`，然后删除
- `CLAUDE.md`、`AGENTS.md` 等文件中的 OpenSpec 标记块

### 命令速查表

```text
/opsx:propose      快速启动（默认 core 配置文件）
/opsx:apply        实现任务
/opsx:archive      完成并归档

# 扩展工作流（如果启用）：
/opsx:new          搭建变更脚手架
/opsx:continue     创建下一个工件
/opsx:ff           创建规划工件
```

---

## 获取帮助

- **Discord**：[discord.gg/YctCnvvshC](https://discord.gg/YctCnvvshC)
- **GitHub Issues**：[github.com/Fission-AI/OpenSpec/issues](https://github.com/Fission-AI/OpenSpec/issues)
- **文档**：[docs/opsx.md](opsx.md) 获取完整的 OPSX 参考
