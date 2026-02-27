# CLI 参考

OpenSpec CLI（`openspec`）提供用于项目设置、验证、状态检查和管理终端命令。这些命令补充了[命令](commands.md)中记录的 AI 斜杠命令（如 `/opsx:propose`）。

## 摘要

| 类别         | 命令                                                            | 用途                          |
| ------------ | --------------------------------------------------------------- | ----------------------------- |
| **设置**     | `init`, `update`                                                | 在项目中初始化和更新 OpenSpec |
| **浏览**     | `list`, `view`, `show`                                          | 浏览变更和规范                |
| **验证**     | `validate`                                                      | 检查变更和规范是否存在问题    |
| **生命周期** | `archive`                                                       | 归档已完成的变更              |
| **工作流**   | `status`, `instructions`, `templates`, `schemas`                | 工件驱动的工作流支持          |
| **模式**     | `schema init`, `schema fork`, `schema validate`, `schema which` | 创建和管理自定义工作流        |
| **配置**     | `config`                                                        | 查看和修改设置                |
| **实用工具** | `feedback`, `completion`                                        | 反馈和 Shell 集成             |

---

## 人工命令与代理命令

大多数 CLI 命令是为**终端中的人工使用**而设计的。部分命令还通过 JSON 输出支持**代理/脚本使用**。

### 仅限人工命令

这些命令是交互式的，专为终端使用而设计：

| 命令                          | 用途                     |
| ----------------------------- | ------------------------ |
| `openspec init`               | 初始化项目（交互式提示） |
| `openspec view`               | 交互式仪表板             |
| `openspec config edit`        | 在编辑器中打开配置       |
| `openspec feedback`           | 通过 GitHub 提交反馈     |
| `openspec completion install` | 安装 Shell 补全          |

### 代理兼容命令

这些命令支持 `--json` 输出，供 AI 代理和脚本编程使用：

| 命令                    | 人工使用       | 代理使用                    |
| ----------------------- | -------------- | --------------------------- |
| `openspec list`         | 浏览变更/规范  | `--json` 获取结构化数据     |
| `openspec show <item>`  | 读取内容       | `--json` 用于解析           |
| `openspec validate`     | 检查问题       | `--all --json` 进行批量验证 |
| `openspec status`       | 查看工件进度   | `--json` 获取结构化状态     |
| `openspec instructions` | 获取下一步操作 | `--json` 获取代理指令       |
| `openspec templates`    | 查找模板路径   | `--json` 用于路径解析       |
| `openspec schemas`      | 列出可用模式   | `--json` 用于模式发现       |

---

## 全局选项

这些选项适用于所有命令：

| 选项              | 描述             |
| ----------------- | ---------------- |
| `--version`, `-V` | 显示版本号       |
| `--no-color`      | 禁用彩色输出     |
| `--help`, `-h`    | 显示命令帮助信息 |

---

## 设置命令

### `openspec init`

在项目中初始化 OpenSpec。创建文件夹结构并配置 AI 工具集成。

默认行为使用全局配置默认值：配置文件 `core`，交付方式 `both`，工作流 `propose, explore, apply, archive`。

```
openspec init [path] [options]
```

**参数：**

| 参数   | 是否必需 | 描述                       |
| ------ | -------- | -------------------------- |
| `path` | 否       | 目标目录（默认为当前目录） |

**选项：**

| 选项                  | 描述                                                    |
| --------------------- | ------------------------------------------------------- |
| `--tools <list>`      | 非交互式配置 AI 工具。使用 `all`、`none` 或逗号分隔列表 |
| `--force`             | 自动清理遗留文件，无需提示                              |
| `--profile <profile>` | 为此初始化运行覆盖全局配置文件（`core` 或 `custom`）    |

`--profile custom` 使用当前在全局配置中选定的工作流（`openspec config profile`）。

**支持的工具 ID（`--tools`）：** `amazon-q`, `antigravity`, `auggie`, `claude`, `cline`, `codex`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `kilocode`, `kiro`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `trae`, `windsurf`

**示例：**

```bash
# 交互式初始化
openspec init

# 在特定目录中初始化
openspec init ./my-project

# 非交互式：为 Claude 和 Cursor 配置
openspec init --tools claude,cursor

# 为所有支持的工具配置
openspec init --tools all

# 为此运行覆盖配置文件
openspec init --profile core

# 跳过提示并自动清理遗留文件
openspec init --force
```

**创建的内容：**

```
openspec/
├── specs/              # 您的规范（真实来源）
├── changes/            # 提议的变更
└── config.yaml         # 项目配置

.claude/skills/         # Claude Code 技能（如果选择了 claude）
.cursor/skills/         # Cursor 技能（如果选择了 cursor）
.cursor/commands/       # Cursor OPSX 命令（如果交付方式包括命令）
... （其他工具配置）
```

---

### `openspec update`

升级 CLI 后更新 OpenSpec 指令文件。使用您当前的全局配置文件、选定的工作流和交付方式重新生成 AI 工具配置文件。

```
openspec update [path] [options]
```

**参数：**

| 参数   | 是否必需 | 描述                       |
| ------ | -------- | -------------------------- |
| `path` | 否       | 目标目录（默认为当前目录） |

**选项：**

| 选项      | 描述                       |
| --------- | -------------------------- |
| `--force` | 即使文件是最新的也强制更新 |

**示例：**

```bash
# npm 升级后更新指令文件
npm update @fission-ai/openspec
openspec update
```

---

## 浏览命令

### `openspec list`

列出项目中的变更或规范。

```
openspec list [options]
```

**选项：**

| 选项             | 描述                              |
| ---------------- | --------------------------------- |
| `--specs`        | 列出规范而不是变更                |
| `--changes`      | 列出变更（默认）                  |
| `--sort <order>` | 按 `recent`（默认）或 `name` 排序 |
| `--json`         | 输出为 JSON                       |

**示例：**

```bash
# 列出所有活跃变更
openspec list

# 列出所有规范
openspec list --specs

# 为脚本输出 JSON
openspec list --json
```

**输出（文本）：**

```
Active changes:
  add-dark-mode     UI theme switching support
  fix-login-bug     Session timeout handling
```

---

### `openspec view`

显示用于浏览规范和变更的交互式仪表板。

```
openspec view
```

打开一个基于终端的界面，用于浏览项目的规范和变更。

---

### `openspec show`

显示变更或规范的详细信息。

```
openspec show [item-name] [options]
```

**参数：**

| 参数        | 是否必需 | 描述                               |
| ----------- | -------- | ---------------------------------- |
| `item-name` | 否       | 变更或规范的名称（如果省略则提示） |

**选项：**

| 选项               | 描述                                               |
| ------------------ | -------------------------------------------------- |
| `--type <type>`    | 指定类型：`change` 或 `spec`（如果明确则自动检测） |
| `--json`           | 输出为 JSON                                        |
| `--no-interactive` | 禁用提示                                           |

**变更特定选项：**

| 选项            | 描述                        |
| --------------- | --------------------------- |
| `--deltas-only` | 仅显示增量规范（JSON 模式） |

**规范特定选项：**

| 选项                     | 描述                                     |
| ------------------------ | ---------------------------------------- |
| `--requirements`         | 仅显示需求，排除场景（JSON 模式）        |
| `--no-scenarios`         | 排除场景内容（JSON 模式）                |
| `-r, --requirement <id>` | 按基于 1 的索引显示特定需求（JSON 模式） |

**示例：**

```bash
# 交互式选择
openspec show

# 显示特定变更
openspec show add-dark-mode

# 显示特定规范
openspec show auth --type spec

# 输出 JSON 供解析
openspec show add-dark-mode --json
```

---

## 验证命令

### `openspec validate`

验证变更和规范是否存在结构问题。

```
openspec validate [item-name] [options]
```

**参数：**

| 参数        | 是否必需 | 描述                               |
| ----------- | -------- | ---------------------------------- |
| `item-name` | 否       | 要验证的特定项目（如果省略则提示） |

**选项：**

| 选项                | 描述                                                          |
| ------------------- | ------------------------------------------------------------- |
| `--all`             | 验证所有变更和规范                                            |
| `--changes`         | 验证所有变更                                                  |
| `--specs`           | 验证所有规范                                                  |
| `--type <type>`     | 当名称有歧义时指定类型：`change` 或 `spec`                    |
| `--strict`          | 启用严格验证模式                                              |
| `--json`            | 输出为 JSON                                                   |
| `--concurrency <n>` | 最大并行验证数（默认：6，或 `OPENSPEC_CONCURRENCY` 环境变量） |
| `--no-interactive`  | 禁用提示                                                      |

**示例：**

```bash
# 交互式验证
openspec validate

# 验证特定变更
openspec validate add-dark-mode

# 验证所有变更
openspec validate --changes

# 使用 JSON 输出验证所有内容（用于 CI/脚本）
openspec validate --all --json

# 严格验证并增加并行度
openspec validate --all --strict --concurrency 12
```

**输出（文本）：**

```
Validating add-dark-mode...
  ✓ proposal.md valid
  ✓ specs/ui/spec.md valid
  ⚠ design.md: missing "Technical Approach" section

1 warning found
```

**输出（JSON）：**

```json
{
  "version": "1.0.0",
  "results": {
    "changes": [
      {
        "name": "add-dark-mode",
        "valid": true,
        "warnings": ["design.md: missing 'Technical Approach' section"]
      }
    ]
  },
  "summary": {
    "total": 1,
    "valid": 1,
    "invalid": 0
  }
}
```

---

## 生命周期命令

### `openspec archive`

归档已完成的变更并将增量规范合并到主规范中。

```
openspec archive [change-name] [options]
```

**参数：**

| 参数          | 是否必需 | 描述                           |
| ------------- | -------- | ------------------------------ |
| `change-name` | 否       | 要归档的变更（如果省略则提示） |

**选项：**

| 选项            | 描述                                           |
| --------------- | ---------------------------------------------- |
| `-y, --yes`     | 跳过确认提示                                   |
| `--skip-specs`  | 跳过规范更新（用于基础设施/工具/仅文档的变更） |
| `--no-validate` | 跳过验证（需要确认）                           |

**示例：**

```bash
# 交互式归档
openspec archive

# 归档特定变更
openspec archive add-dark-mode

# 无提示归档（CI/脚本）
openspec archive add-dark-mode --yes

# 归档不影响规范的工具变更
openspec archive update-ci-config --skip-specs
```

**功能：**

1. 验证变更（除非使用 `--no-validate`）
2. 提示确认（除非使用 `--yes`）
3. 将增量规范合并到 `openspec/specs/`
4. 将变更文件夹移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`

---

## 工作流命令

这些命令支持工件驱动的 OPSX 工作流。它们对于人工检查进度和代理确定下一步操作都很有用。

### `openspec status`

显示变更的工件完成状态。

```
openspec status [options]
```

**选项：**

| 选项              | 描述                             |
| ----------------- | -------------------------------- |
| `--change <id>`   | 变更名称（如果省略则提示）       |
| `--schema <name>` | 覆盖模式（从变更的配置自动检测） |
| `--json`          | 输出为 JSON                      |

**示例：**

```bash
# 交互式状态检查
openspec status

# 特定变更的状态
openspec status --change add-dark-mode

# 供代理使用的 JSON
openspec status --change add-dark-mode --json
```

**输出（文本）：**

```
Change: add-dark-mode
Schema: spec-driven
Progress: 2/4 artifacts complete

[x] proposal
[ ] design
[x] specs
[-] tasks (blocked by: design)
```

**输出（JSON）：**

```json
{
  "changeName": "add-dark-mode",
  "schemaName": "spec-driven",
  "isComplete": false,
  "applyRequires": ["tasks"],
  "artifacts": [
    { "id": "proposal", "outputPath": "proposal.md", "status": "done" },
    { "id": "design", "outputPath": "design.md", "status": "ready" },
    { "id": "specs", "outputPath": "specs/**/*.md", "status": "done" },
    {
      "id": "tasks",
      "outputPath": "tasks.md",
      "status": "blocked",
      "missingDeps": ["design"]
    }
  ]
}
```

---

### `openspec instructions`

获取用于创建工件或应用任务的增强指令。供 AI 代理用于理解下一步要创建什么。

```
openspec instructions [artifact] [options]
```

**参数：**

| 参数       | 是否必需 | 描述                                                       |
| ---------- | -------- | ---------------------------------------------------------- |
| `artifact` | 否       | 工件 ID：`proposal`、`specs`、`design`、`tasks` 或 `apply` |

**选项：**

| 选项              | 描述                           |
| ----------------- | ------------------------------ |
| `--change <id>`   | 变更名称（在非交互模式下必需） |
| `--schema <name>` | 覆盖模式                       |
| `--json`          | 输出为 JSON                    |

**特殊情况：** 使用 `apply` 作为工件获取任务实现指令。

**示例：**

```bash
# 获取下一个工件的指令
openspec instructions --change add-dark-mode

# 获取特定工件指令
openspec instructions design --change add-dark-mode

# 获取应用/实现指令
openspec instructions apply --change add-dark-mode

# 供代理使用的 JSON
openspec instructions design --change add-dark-mode --json
```

**输出包括：**

- 工件的模板内容
- 来自配置的项目上下文
- 来自依赖工件的内容
- 来自配置的每个工件规则

---

### `openspec templates`

显示模式中所有工件的已解析模板路径。

```
openspec templates [options]
```

**选项：**

| 选项              | 描述                                |
| ----------------- | ----------------------------------- |
| `--schema <name>` | 要检查的模式（默认：`spec-driven`） |
| `--json`          | 输出为 JSON                         |

**示例：**

```bash
# 显示默认模式的模板路径
openspec templates

# 显示自定义模式的模板
openspec templates --schema my-workflow

# 供编程使用的 JSON
openspec templates --json
```

**输出（文本）：**

```
Schema: spec-driven

Templates:
  proposal  → ~/.openspec/schemas/spec-driven/templates/proposal.md
  specs     → ~/.openspec/schemas/spec-driven/templates/specs.md
  design    → ~/.openspec/schemas/spec-driven/templates/design.md
  tasks     → ~/.openspec/schemas/spec-driven/templates/tasks.md
```

---

### `openspec schemas`

列出可用的工作流模式及其描述和工件流程。

```
openspec schemas [options]
```

**选项：**

| 选项     | 描述        |
| -------- | ----------- |
| `--json` | 输出为 JSON |

**示例：**

```bash
openspec schemas
```

**输出：**

```
Available schemas:

  spec-driven (package)
    The default spec-driven development workflow
    Flow: proposal → specs → design → tasks

  my-custom (project)
    Custom workflow for this project
    Flow: research → proposal → tasks
```

---

## 模式命令

用于创建和管理自定义工作流模式的命令。

### `openspec schema init`

创建新的项目本地模式。

```
openspec schema init <name> [options]
```

**参数：**

| 参数   | 是否必需 | 描述                        |
| ------ | -------- | --------------------------- |
| `name` | 是       | 模式名称（kebab-case 格式） |

**选项：**

| 选项                   | 描述                                                     |
| ---------------------- | -------------------------------------------------------- |
| `--description <text>` | 模式描述                                                 |
| `--artifacts <list>`   | 逗号分隔的工件 ID（默认：`proposal,specs,design,tasks`） |
| `--default`            | 设置为项目默认模式                                       |
| `--no-default`         | 不提示设置为默认                                         |
| `--force`              | 覆盖现有模式                                             |
| `--json`               | 输出为 JSON                                              |

**示例：**

```bash
# 交互式模式创建
openspec schema init research-first

# 非交互式，带特定工件
openspec schema init rapid \
  --description "Rapid iteration workflow" \
  --artifacts "proposal,tasks" \
  --default
```

**创建的内容：**

```
openspec/schemas/<name>/
├── schema.yaml           # 模式定义
└── templates/
    ├── proposal.md       # 每个工件的模板
    ├── specs.md
    ├── design.md
    └── tasks.md
```

---

### `openspec schema fork`

将现有模式复制到您的项目中进行自定义。

```
openspec schema fork <source> [name] [options]
```

**参数：**

| 参数     | 是否必需 | 描述                                  |
| -------- | -------- | ------------------------------------- |
| `source` | 是       | 要复制的模式                          |
| `name`   | 否       | 新模式名称（默认：`<source>-custom`） |

**选项：**

| 选项      | 描述         |
| --------- | ------------ |
| `--force` | 覆盖现有目标 |
| `--json`  | 输出为 JSON  |

**示例：**

```bash
# 复制内置的 spec-driven 模式
openspec schema fork spec-driven my-workflow
```

---

### `openspec schema validate`

验证模式的结构和模板。

```
openspec schema validate [name] [options]
```

**参数：**

| 参数   | 是否必需 | 描述                               |
| ------ | -------- | ---------------------------------- |
| `name` | 否       | 要验证的模式（如果省略则验证所有） |

**选项：**

| 选项        | 描述               |
| ----------- | ------------------ |
| `--verbose` | 显示详细的验证步骤 |
| `--json`    | 输出为 JSON        |

**示例：**

```bash
# 验证特定模式
openspec schema validate my-workflow

# 验证所有模式
openspec schema validate
```

---

### `openspec schema which`

显示模式从何处解析（用于调试优先级）。

```
openspec schema which [name] [options]
```

**参数：**

| 参数   | 是否必需 | 描述     |
| ------ | -------- | -------- |
| `name` | 否       | 模式名称 |

**选项：**

| 选项     | 描述                 |
| -------- | -------------------- |
| `--all`  | 列出所有模式及其来源 |
| `--json` | 输出为 JSON          |

**示例：**

```bash
# 检查模式的来源
openspec schema which spec-driven
```

**输出：**

```
spec-driven resolves from: package
  Source: /usr/local/lib/node_modules/@fission-ai/openspec/schemas/spec-driven
```

**模式优先级：**

1. 项目：`openspec/schemas/<name>/`
2. 用户：`~/.local/share/openspec/schemas/<name>/`
3. 包：内置模式

---

## 配置命令

### `openspec config`

查看和修改全局 OpenSpec 配置。

```
openspec config <subcommand> [options]
```

**子命令：**

| 子命令              | 描述                                   |
| ------------------- | -------------------------------------- |
| `path`              | 显示配置文件位置                       |
| `list`              | 显示所有当前设置                       |
| `get <key>`         | 获取特定值                             |
| `set <key> <value>` | 设置值                                 |
| `unset <key>`       | 删除键                                 |
| `reset`             | 重置为默认值                           |
| `edit`              | 在 `$EDITOR` 中打开                    |
| `profile [preset]`  | 交互式配置工作流配置文件或通过预设配置 |

**示例：**

```bash
# 显示配置文件路径
openspec config path

# 列出所有设置
openspec config list

# 获取特定值
openspec config get telemetry.enabled

# 设置值
openspec config set telemetry.enabled false

# 显式设置字符串值
openspec config set user.name "My Name" --string

# 删除自定义设置
openspec config unset user.name

# 重置所有配置
openspec config reset --all --yes

# 在编辑器中编辑配置
openspec config edit

# 使用基于操作向导配置配置文件
openspec config profile

# 快速预设：将工作流切换为 core（保持交付模式）
openspec config profile core
```

`openspec config profile` 首先显示当前状态摘要，然后让您选择：

- 更改交付 + 工作流
- 仅更改交付
- 仅更改工作流
- 保持当前设置（退出）

如果您保持当前设置，则不会写入任何更改，也不会显示更新提示。
如果没有配置更改但当前项目文件与您的全局配置文件/交付不同步，OpenSpec 将显示警告并建议运行 `openspec update`。
按 `Ctrl+C` 也能干净地取消流程（无堆栈跟踪）并以代码 `130` 退出。
在工作流清单中，`[x]` 表示该工作流已在全局配置中选中。要将这些选择应用到项目文件，请运行 `openspec update`（或在项目内出现提示时选择 `Apply changes to this project now?`）。

**交互式示例：**

```bash
# 仅交付更新
openspec config profile
# 选择：仅更改交付
# 选择交付：仅技能

# 仅工作流更新
openspec config profile
# 选择：仅更改工作流
# 在清单中切换工作流，然后确认
```

---

## 实用工具命令

### `openspec feedback`

提交关于 OpenSpec 的反馈。创建 GitHub issue。

```
openspec feedback <message> [options]
```

**参数：**

| 参数      | 是否必需 | 描述     |
| --------- | -------- | -------- |
| `message` | 是       | 反馈消息 |

**选项：**

| 选项            | 描述     |
| --------------- | -------- |
| `--body <text>` | 详细描述 |

**要求：** 必须安装并认证 GitHub CLI（`gh`）。

**示例：**

```bash
openspec feedback "Add support for custom artifact types" \
  --body "I'd like to define my own artifact types beyond the built-in ones."
```

---

### `openspec completion`

管理 OpenSpec CLI 的 Shell 补全。

```
openspec completion <subcommand> [shell]
```

**子命令：**

| 子命令              | 描述                     |
| ------------------- | ------------------------ |
| `generate [shell]`  | 将补全脚本输出到标准输出 |
| `install [shell]`   | 为您的 Shell 安装补全    |
| `uninstall [shell]` | 删除已安装的补全         |

**支持的 Shell：** `bash`、`zsh`、`fish`、`powershell`

**示例：**

```bash
# 安装补全（自动检测 Shell）
openspec completion install

# 为特定 Shell 安装
openspec completion install zsh

# 生成脚本供手动安装
openspec completion generate bash > ~/.bash_completion.d/openspec

# 卸载
openspec completion uninstall
```

---

## 退出代码

| 代码 | 含义                         |
| ---- | ---------------------------- |
| `0`  | 成功                         |
| `1`  | 错误（验证失败、缺少文件等） |

---

## 环境变量

| 变量                   | 描述                            |
| ---------------------- | ------------------------------- |
| `OPENSPEC_CONCURRENCY` | 批量验证的默认并发数（默认：6） |
| `EDITOR` 或 `VISUAL`   | `openspec config edit` 的编辑器 |
| `NO_COLOR`             | 设置时禁用彩色输出              |

---

## 相关文档

- [命令](commands.md) - AI 斜杠命令（`/opsx:propose`、`/opsx:apply` 等）
- [工作流](workflows.md) - 常见模式及何时使用每个命令
- [自定义](customization.md) - 创建自定义模式和模板
- [入门指南](getting-started.md) - 首次设置指南
