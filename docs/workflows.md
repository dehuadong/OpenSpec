# 工作流

本指南涵盖了 OpenSpec 的常见工作流模式以及何时使用每种模式。有关基本设置，请参阅[入门指南](getting-started.md)。有关命令参考，请参阅[命令](commands.md)。

## 理念：操作，而非阶段

传统工作流强制您经历各个阶段：规划，然后实现，然后完成。但实际工作并不适合整齐地放入这些框框中。

OPSX 采用了不同的方法：

```text
传统（阶段锁定）：

  规划 ────────► 实现 ────────► 完成
      │                    │
      │   “无法回溯”        │
      └────────────────────┘

OPSX（灵活操作）：

  proposal ──► specs ──► design ──► tasks ──► 实现
```

**关键原则：**

- **操作，而非阶段** - 命令是您可以做的事情，而不是您被困在其中的阶段
- **依赖关系是启用器** - 它们显示什么是可能的，而不是下一步必须做什么

> **自定义：** OPSX 工作流由定义工件序列的模式驱动。有关创建自定义模式的详细信息，请参阅[自定义](customization.md)。

## 两种模式

### 默认快速路径（`core` 配置文件）

新安装默认为 `core`，提供：

- `/opsx:propose`
- `/opsx:explore`
- `/opsx:apply`
- `/opsx:archive`

典型流程：

```text
/opsx:propose ──► /opsx:apply ──► /opsx:archive
```

### 扩展/完整工作流（自定义选择）

如果您想要显式的脚手架和构建命令（`/opsx:new`、`/opsx:continue`、`/opsx:ff`、`/opsx:verify`、`/opsx:sync`、`/opsx:bulk-archive`、`/opsx:onboard`），请使用以下命令启用它们：

```bash
openspec config profile
openspec update
```

## 工作流模式（扩展模式）

### 快速功能

当您知道自己想要构建什么并且只需要执行时：

```text
/opsx:new ──► /opsx:ff ──► /opsx:apply ──► /opsx:verify ──► /opsx:archive
```

**示例对话：**

```text
您：/opsx:new add-logout-button

AI： 已创建 openspec/changes/add-logout-button/
     准备创建：proposal

您：/opsx:ff

AI： 正在创建所有规划工件...
     ✓ proposal.md
     ✓ specs/
     ✓ design.md
     ✓ tasks.md
     已准备好实现！

您：/opsx:apply

AI： 正在完成任务...
     ✓ 在页眉添加了登出按钮
     ✓ 实现了会话清理
     ✓ 添加了确认对话框
     所有任务完成！

您：/opsx:archive

AI： ✓ 已合并规范
     ✓ 已归档变更
```

**最佳适用场景：** 中小型功能、错误修复、简单的变更。

### 探索式

当需求不明确或您需要先进行调查时：

```text
/opsx:explore ──► /opsx:new ──► /opsx:continue ──► ... ──► /opsx:apply
```

**示例对话：**

```text
您：/opsx:explore

AI： 您想探索什么？

您：我想提高页面加载性能，但我不确定瓶颈在哪里。

AI： 让我帮您调查...
     [分析包大小、识别慢查询、审查组件渲染模式]

     我发现了三个主要瓶颈：
     1. 大型未优化图片
     2. ProductList 中的同步数据获取
     3. 上下文变化导致的重新渲染

     您想先解决哪一个？

您：我们先处理数据获取问题。

您：/opsx:new optimize-product-list-fetching

AI： 已创建变更。准备创建：proposal

您：/opsx:continue

AI： 正在根据我们的探索创建提案...
     [编写融入调查见解的提案]

     准备创建：specs、design
     您接下来想要哪个？

您：/opsx:continue

AI： 正在创建规范...
```

**最佳适用场景：** 性能优化、调试、架构决策、不明确的需求。

### 并行变更

同时处理多个变更：

```text
变更 A：/opsx:new ──► /opsx:ff ──► /opsx:apply（进行中）
                                         │
                                    上下文切换
                                         │
变更 B：/opsx:new ──► /opsx:ff ──────► /opsx:apply
```

**示例对话：**

```text
您：我正在处理 add-dark-mode，但被拉去修复一个错误

您：/opsx:new fix-login-redirect

AI： 已创建 openspec/changes/fix-login-redirect/

您：/opsx:ff

AI： ✓ 已创建规划工件

您：/opsx:apply

AI： 正在处理 fix-login-redirect...
     [实现修复]
     所有任务完成！

您：/opsx:archive

AI： ✓ 已归档 fix-login-redirect

您：我们继续处理暗色模式

您：/opsx:apply add-dark-mode

AI： 正在恢复 add-dark-mode...
     从任务 2.3 继续：更新页眉...
```

**最佳适用场景：** 并行工作流、紧急中断、团队协作。

当您有多个已完成的变更时，使用 `/opsx:bulk-archive`：

```text
您：/opsx:bulk-archive

AI： 找到 3 个已完成的变更：
     - add-dark-mode（所有任务完成）
     - fix-login-redirect（所有任务完成）
     - update-footer（所有任务完成）

     检查规范冲突...
     ⚠ add-dark-mode 和 update-footer 都涉及 specs/ui/

     检查代码库以解决...
     两个变更都已实现。将按时间顺序应用。

     归档所有 3 个变更？

您：是

AI： ✓ 已归档 add-dark-mode
     ✓ 已归档 fix-login-redirect
     ✓ 已归档 update-footer
     规范已按顺序合并：add-dark-mode → update-footer
```

批量归档检测多个变更何时触及相同的规范，并通过检查实际实现来解决冲突。

### 完成变更

推荐的完成流程：

```text
/opsx:apply ──► /opsx:verify ──► /opsx:archive
                    │                 │
              验证实现             提示同步
              是否符合            （如果需要）
```

#### Verify：检查您的工作

`/opsx:verify` 根据您的工件在三个维度上验证实现：

```text
您：/opsx:verify

AI： 正在验证 add-auth...

     完整性
     ✓ tasks.md 中所有 12 个任务均已勾选
     ✓ 规范中的所有需求都有对应的代码
     ⚠ 场景“不活动后会话超时”未测试

     正确性
     ✓ 实现符合规范意图
     ✓ 处理了场景中的边界情况
     ✓ 错误状态与规范定义匹配

     一致性
     ✓ 设计决策反映在代码结构中
     ✓ 命名约定与 design.md 一致
     ⚠ 设计提到“事件驱动”但实现使用了轮询

     摘要
     ─────────────────────────────
     严重问题：0
     警告：2
     准备归档：是（有警告）

     建议：
     1. 为会话超时场景添加测试
     2. 考虑按设计重构为事件驱动，或更新 design.md
```

**verify 检查的内容：**

| 维度   | 验证内容                             |
| ------ | ------------------------------------ |
| 完整性 | 所有任务完成，所有需求实现，场景覆盖 |
| 正确性 | 实现符合规范意图，处理边界情况       |
| 一致性 | 设计决策反映在代码中，模式一致       |

Verify 不会阻止归档，但会暴露您可能想要先处理的问题。

#### Archive：完成变更

`/opsx:archive` 完成变更并将其移至归档：

```text
您：/opsx:archive

AI： 正在归档 add-auth...

     工件状态：
     ✓ proposal.md 存在
     ✓ specs/ 存在
     ✓ design.md 存在
     ✓ tasks.md 存在（12/12 任务完成）

     增量规范：尚未同步到主规范
     → 现在同步？

您：是

AI： ✓ 已同步规范至 openspec/specs/auth/spec.md
     ✓ 已移至 openspec/changes/archive/2025-01-24-add-auth/

     变更归档成功。
```

如果规范未同步，Archive 会提示。它不会因任务未完成而阻止，但会发出警告。

## 何时使用什么

### `/opsx:ff` vs `/opsx:continue`

| 情况                   | 使用             |
| ---------------------- | ---------------- |
| 需求清晰，准备构建     | `/opsx:ff`       |
| 探索中，想审查每一步   | `/opsx:continue` |
| 想在规范之前迭代提案   | `/opsx:continue` |
| 时间紧迫，需要快速推进 | `/opsx:ff`       |
| 复杂变更，想要控制     | `/opsx:continue` |

**经验法则：** 如果您可以预先描述完整范围，使用 `/opsx:ff`。如果您在过程中逐步弄清楚，使用 `/opsx:continue`。

### 何时更新与何时重新开始

一个常见问题：何时更新现有变更是可以的，何时应该开始一个新的？

**应更新现有变更的情况：**

- 相同意图，优化执行
- 范围缩小（先做 MVP，其余稍后）
- 学习驱动的修正（代码库并非您所想的那样）
- 基于实现发现的设计调整

**应启动新变更的情况：**

- 意图根本改变
- 范围爆炸成完全不同的工作
- 原始变更可以独立标记为“完成”
- 修补会带来混淆而非澄清

```text
                     ┌─────────────────────────────────────┐
                     │     这是同一个工作吗？               │
                     └──────────────┬──────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
           相同意图？         >50% 重叠？       没有这些变更，
           相同问题？         相同范围？        原始变更能“完成”吗？
                 │                  │                  │
       ┌────────┴────────┐  ┌──────┴──────┐   ┌───────┴───────┐
       │                 │  │             │   │               │
      是                否 是            否  否              是
       │                 │  │             │   │               │
       ▼                 ▼  ▼             ▼   ▼               ▼
    更新               新  更新          新  更新             新
```

**示例：“添加暗色模式”**

- “还需要支持自定义主题” → 新变更（范围爆炸）
- “系统偏好检测比预期困难” → 更新（相同意图）
- “我们先发布切换开关，稍后添加偏好” → 更新然后归档，然后新变更

## 最佳实践

### 保持变更聚焦

每个变更一个逻辑工作单元。如果您正在“添加功能 X 并且重构 Y”，考虑分成两个独立的变更。

**为什么重要：**

- 更容易审查和理解
- 更清晰的归档历史
- 可以独立发布
- 如果需要，回滚更简单

### 对不明确的需求使用 `/opsx:explore`

在提交变更之前，探索问题空间：

```text
您：/opsx:explore

AI： 您想探索什么？

您：我们应该如何处理 API 的速率限制？

AI： 让我调查您当前的设置和选项...
     [研究代码库，考虑模式]

     我看到我们可以采取三种方法：
     1. 基于中间件（简单，每个端点）
     2. Redis 支持（可扩展，共享状态）
     3. 每用户令牌桶（公平，复杂）

     您当前的堆栈建议使用 #1 或 #2。您的规模是多少？
```

探索在创建工件之前澄清思路。

### 归档前验证

使用 `/opsx:verify` 检查实现是否与工件匹配：

```text
您：/opsx:verify

AI： 正在验证 add-dark-mode...

     ✓ tasks.md 中所有任务均已勾选
     ✓ 规范中的需求有对应的代码
     ✓ 设计决策反映在实现中

     准备归档！
```

在您关闭变更之前发现问题。

### 清晰命名变更

好的命名使 `openspec list` 有用：

```text
好的：                          避免：
add-dark-mode                  feature-1
fix-login-redirect             update
optimize-product-query         changes
implement-2fa                  wip
```

## 命令快速参考

有关完整的命令详细信息和选项，请参阅[命令](commands.md)。

| 命令                 | 用途                | 何时使用                        |
| -------------------- | ------------------- | ------------------------------- |
| `/opsx:propose`      | 创建变更 + 规划工件 | 快速默认路径（`core` 配置文件） |
| `/opsx:explore`      | 思考想法            | 不明确的需求、调查              |
| `/opsx:new`          | 启动变更脚手架      | 扩展模式，显式工件控制          |
| `/opsx:continue`     | 创建下一个工件      | 扩展模式，逐步创建工件          |
| `/opsx:ff`           | 创建所有规划工件    | 扩展模式，范围清晰              |
| `/opsx:apply`        | 实现任务            | 准备编写代码                    |
| `/opsx:verify`       | 验证实现            | 扩展模式，归档前                |
| `/opsx:sync`         | 合并增量规范        | 扩展模式，可选                  |
| `/opsx:archive`      | 完成变更            | 所有工作完成                    |
| `/opsx:bulk-archive` | 归档多个变更        | 扩展模式，并行工作              |

## 后续步骤

- [命令](commands.md) - 带选项的完整命令参考
- [概念](concepts.md) - 深入了解规范、工件和模式
- [自定义](customization.md) - 创建自定义工作流
