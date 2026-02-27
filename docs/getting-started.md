# 入门指南

本指南说明 OpenSpec 在您安装并初始化后的工作原理。有关安装说明，请参阅[主 README](../README.md#quick-start)。

## 工作原理

OpenSpec 帮助您和您的 AI 编程助手指在编写任何代码之前就构建目标达成一致。

**默认快速路径（core 配置文件）：**

```text
/opsx:propose ──► /opsx:apply ──► /opsx:archive
```

**扩展路径（自定义工作流选择）：**

```text
/opsx:new ──► /opsx:ff 或 /opsx:continue ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

默认全局配置文件为 `core`，包含 `propose`、`explore`、`apply` 和 `archive`。您可以通过 `openspec config profile` 启用扩展工作流命令，然后运行 `openspec update`。

## OpenSpec 创建的内容

运行 `openspec init` 后，您的项目将具有以下结构：

```
openspec/
├── specs/              # 真实来源（系统行为）
│   └── <domain>/
│       └── spec.md
├── changes/            # 提议的更新（每个变更一个文件夹）
│   └── <change-name>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/      # 增量规范（变化内容）
│           └── <domain>/
│               └── spec.md
└── config.yaml         # 项目配置（可选）
```

**两个关键目录：**

- **`specs/`** - 真实来源。这些规范描述了系统当前的行为方式。按领域组织（例如 `specs/auth/`、`specs/payments/`）。

- **`changes/`** - 提议的修改。每个变更都有自己独立的文件夹，包含所有相关工件。当变更完成时，其规范会合并到主 `specs/` 目录中。

## 理解工件

每个变更文件夹包含指导工作的工件：

| 工件          | 用途                                       |
| ------------- | ------------------------------------------ |
| `proposal.md` | “为什么”和“做什么”——捕捉意图、范围和方法   |
| `specs/`      | 显示 ADDED/MODIFIED/REMOVED 需求的增量规范 |
| `design.md`   | “如何做”——技术方法和架构决策               |
| `tasks.md`    | 带复选框的实现清单                         |

**工件相互构建：**

```
proposal ──► specs ──► design ──► tasks ──► 实现
   ▲           ▲          ▲                    │
   └───────────┴──────────┴────────────────────┘
            在实现过程中边学习边更新
```

在实现过程中，您可以随时返回并完善早期的工件。

## 增量规范的工作原理

增量规范是 OpenSpec 中的关键概念。它们显示相对于当前规范的变化。

### 格式

增量规范使用部分来指示变更类型：

```markdown
# Delta for Auth

## ADDED Requirements

### Requirement: Two-Factor Authentication

系统 MUST 在登录时要求第二个因素。

#### Scenario: OTP required

- GIVEN 启用了 2FA 的用户
- WHEN 用户提交有效凭据
- THEN 显示 OTP 挑战

## MODIFIED Requirements

### Requirement: Session Timeout

系统 SHALL 在 30 分钟不活动后使会话过期。
（之前：60 分钟）

#### Scenario: Idle timeout

- GIVEN 已认证的会话
- WHEN 30 分钟没有活动
- THEN 会话失效

## REMOVED Requirements

### Requirement: Remember Me

（已弃用，改为使用 2FA）
```

### 归档时发生什么

当您归档变更时：

1. **ADDED** 需求被追加到主规范
2. **MODIFIED** 需求替换现有版本
3. **REMOVED** 需求从主规范中删除

变更文件夹会移动到 `openspec/changes/archive/` 以供审计追溯。

## 示例：您的第一个变更

让我们逐步完成向应用程序添加暗色模式的过程。

### 1. 启动变更（默认）

```text
您：/opsx:propose add-dark-mode

AI： 已创建 openspec/changes/add-dark-mode/
     ✓ proposal.md — 为什么做这个，要改变什么
     ✓ specs/       — 需求和场景
     ✓ design.md    — 技术方法
     ✓ tasks.md     — 实现清单
     已准备好实现！
```

如果您启用了扩展工作流配置文件，也可以分两步完成：先 `/opsx:new`，然后 `/opsx:ff`（或逐步使用 `/opsx:continue`）。

### 2. 创建的内容

**proposal.md** - 捕捉意图：

```markdown
# Proposal: Add Dark Mode

## Intent

用户要求添加暗色模式选项，以减少夜间使用时的眼睛疲劳。

## Scope

- 在设置中添加主题切换
- 支持系统偏好检测
- 在 localStorage 中保存偏好

## Approach

使用 CSS 自定义属性进行主题设置，结合 React 上下文进行状态管理。
```

**specs/ui/spec.md** - 显示新需求的增量规范：

```markdown
# Delta for UI

## ADDED Requirements

### Requirement: Theme Selection

系统 SHALL 允许用户在亮色和暗色主题之间选择。

#### Scenario: Manual toggle

- GIVEN 任意页面上的用户
- WHEN 用户点击主题切换按钮
- THEN 主题立即切换
- AND 偏好跨会话持久化

#### Scenario: System preference

- GIVEN 没有保存偏好的用户
- WHEN 应用程序加载
- THEN 使用系统的首选配色方案
```

**tasks.md** - 实现清单：

```markdown
# Tasks

## 1. Theme Infrastructure

- [ ] 1.1 创建带亮/暗状态的 ThemeContext
- [ ] 1.2 为颜色添加 CSS 自定义属性
- [ ] 1.3 实现 localStorage 持久化

## 2. UI Components

- [ ] 2.1 创建 ThemeToggle 组件
- [ ] 2.2 在设置页面添加切换开关
- [ ] 2.3 更新 Header 包含快速切换

## 3. Styling

- [ ] 3.1 定义暗色主题调色板
- [ ] 3.2 更新组件以使用 CSS 变量
```

### 3. 实现

```
您：/opsx:apply

AI： 正在完成任务...
     ✓ 1.1 创建了带亮/暗状态的 ThemeContext
     ✓ 1.2 向 globals.css 添加了 CSS 自定义属性
     ✓ 1.3 实现了 localStorage 持久化
     ✓ 2.1 创建了 ThemeToggle 组件
     ...
     所有任务完成！
```

在实现过程中，如果您发现设计需要调整，只需更新工件然后继续即可。

### 4. 归档

```
您：/opsx:archive

AI： 正在归档 add-dark-mode...
     ✓ 已将规范合并到 openspec/specs/ui/spec.md
     ✓ 已移至 openspec/changes/archive/2025-01-24-add-dark-mode/
     完成！已准备好处理下一个功能。
```

您的增量规范现在已成为主规范的一部分，记录了系统的工作方式。

## 验证和审查

使用 CLI 检查您的变更：

```bash
# 列出活跃变更
openspec list

# 查看变更详情
openspec show add-dark-mode

# 验证规范格式
openspec validate add-dark-mode

# 交互式仪表板
openspec view
```

## 后续步骤

- [工作流](workflows.md) - 常见模式及何时使用每种命令
- [命令](commands.md) - 所有斜杠命令的完整参考
- [概念](concepts.md) - 深入了解规范、变更和模式
- [自定义](customization.md) - 让 OpenSpec 以您的方式工作
