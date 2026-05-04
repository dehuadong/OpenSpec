/**
 * 技能模板工作流模块
 *
 * 此文件由将旧版单体模板文件拆分为面向工作流的模块生成。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getSyncSpecsSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-sync-specs',
    description:
      '将变更的增量规范同步到主规范。当用户希望使用增量规范中的变更更新主规范，且无需归档该变更时使用。',
    instructions: `将变更的增量规范同步到主规范。

这是一个**智能体驱动**的操作——你将阅读增量规范并直接编辑主规范以应用变更。这允许智能合并（例如，添加场景而无需复制整个需求）。

**输入**：可选择指定变更名称。若省略，请检查是否可从对话上下文中推断。若表述模糊或不明确，你**必须**提示用户选择可用的变更。

**步骤**

1. **若未提供变更名称，提示用户选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具**让用户进行选择。

   显示包含增量规范的变更（位于 \`specs/\` 目录下）。

   **重要**：切勿猜测或自动选择变更。始终让用户自行选择。

2. **查找增量规范**

   在 \`openspec/changes/<name>/specs/*/spec.md\` 中查找增量规范文件。

   每个增量规范文件包含如下章节：
   - \`## ADDED Requirements\` - 需要新增的需求
   - \`## MODIFIED Requirements\` - 对现有需求的变更
   - \`## REMOVED Requirements\` - 需要移除的需求
   - \`## RENAMED Requirements\` - 需要重命名的需求（FROM:/TO: 格式）

   若未找到增量规范，通知用户并终止操作。

3. **针对每个增量规范，将变更应用到主规范**

   对于在 \`openspec/changes/<name>/specs/<capability>/spec.md\` 处具有增量规范的每个功能模块：

   a. **阅读增量规范**以理解预期变更

   b. **阅读主规范**，位于 \`openspec/specs/<capability>/spec.md\`（可能尚不存在）

   c. **智能应用变更**：

      **ADDED Requirements（新增需求）：**
      - 若需求在主规范中不存在 → 添加它
      - 若需求已存在 → 更新它以匹配变更（视为隐式 MODIFIED）

      **MODIFIED Requirements（修改需求）：**
      - 在主规范中找到该需求
      - 应用变更——这可能包括：
        - 添加新场景（无需复制现有场景）
        - 修改现有场景
        - 更改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements（移除需求）：**
      - 从主规范中移除整个需求块

      **RENAMED Requirements（重命名需求）：**
      - 找到 FROM 需求，将其重命名为 TO

   d. **若功能模块尚不存在，则创建新主规范**：
      - 创建 \`openspec/specs/<capability>/spec.md\`
      - 添加 Purpose（目的）章节（可简短，标记为 TBD）
      - 添加 Requirements（需求）章节并包含 ADDED（新增）需求

4. **显示摘要**

   应用所有变更后，进行总结：
   - 更新了哪些功能模块
   - 进行了哪些变更（需求新增/修改/移除/重命名）

**增量规范格式参考**

\`\`\`markdown
## ADDED Requirements

### Requirement: New Feature
The system SHALL do something new.

#### Scenario: Basic case
- **WHEN** user does X
- **THEN** system does Y

## MODIFIED Requirements

### Requirement: Existing Feature
#### Scenario: New scenario to add
- **WHEN** user does A
- **THEN** system does B

## REMOVED Requirements

### Requirement: Deprecated Feature

## RENAMED Requirements

- FROM: \`### Requirement: Old Name\`
- TO: \`### Requirement: New Name\`
\`\`\`

**核心原则：智能合并**

与程序化合并不同，你可以应用**局部更新**：
- 若要添加场景，只需在 MODIFIED 下包含该场景即可——无需复制现有场景
- 增量代表的是*意图*，而非整体替换
- 运用你的判断力合理合并变更

**成功时的输出**

\`\`\`
## Specs Synced: <change-name>

Updated main specs:

**<capability-1>**:
- Added requirement: "New Feature"
- Modified requirement: "Existing Feature" (added 1 scenario)

**<capability-2>**:
- Created new spec file
- Added requirement: "Another Feature"

Main specs are now updated. The change remains active - archive when implementation is complete.
\`\`\`

**安全准则**
- 在进行变更前，同时阅读增量规范和主规范
- 保留增量中未提及的现有内容
- 若有不明确之处，请求澄清
- 逐步展示你正在进行的变更
- 操作应具备幂等性——执行两次应得到相同结果`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxSyncCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Sync',
    description: '将变更的增量规范同步到主规范',
    category: '工作流',
    tags: ['工作流', '规范', '实验性'],
    content: `将变更的增量规范同步到主规范。

这是一个**智能体驱动**的操作——你将阅读增量规范并直接编辑主规范以应用变更。这允许智能合并（例如，添加场景而无需复制整个需求）。

**输入**：可选择在 \`/opsx:sync\` 后指定变更名称（例如 \`/opsx:sync add-auth\`）。若省略，请检查是否可从对话上下文中推断。若表述模糊或不明确，你**必须**提示用户选择可用的变更。

**步骤**

1. **若未提供变更名称，提示用户选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具**让用户进行选择。

   显示包含增量规范的变更（位于 \`specs/\` 目录下）。

   **重要**：切勿猜测或自动选择变更。始终让用户自行选择。

2. **查找增量规范**

   在 \`openspec/changes/<name>/specs/*/spec.md\` 中查找增量规范文件。

   每个增量规范文件包含如下章节：
   - \`## ADDED Requirements\` - 需要新增的需求
   - \`## MODIFIED Requirements\` - 对现有需求的变更
   - \`## REMOVED Requirements\` - 需要移除的需求
   - \`## RENAMED Requirements\` - 需要重命名的需求（FROM:/TO: 格式）

   若未找到增量规范，通知用户并终止操作。

3. **针对每个增量规范，将变更应用到主规范**

   对于在 \`openspec/changes/<name>/specs/<capability>/spec.md\` 处具有增量规范的每个功能模块：

   a. **阅读增量规范**以理解预期变更

   b. **阅读主规范**，位于 \`openspec/specs/<capability>/spec.md\`（可能尚不存在）

   c. **智能应用变更**：

      **ADDED Requirements（新增需求）：**
      - 若需求在主规范中不存在 → 添加它
      - 若需求已存在 → 更新它以匹配变更（视为隐式 MODIFIED）

      **MODIFIED Requirements（修改需求）：**
      - 在主规范中找到该需求
      - 应用变更——这可能包括：
        - 添加新场景（无需复制现有场景）
        - 修改现有场景
        - 更改需求描述
      - 保留增量中未提及的场景/内容

      **REMOVED Requirements（移除需求）：**
      - 从主规范中移除整个需求块

      **RENAMED Requirements（重命名需求）：**
      - 找到 FROM 需求，将其重命名为 TO

   d. **若功能模块尚不存在，则创建新主规范**：
      - 创建 \`openspec/specs/<capability>/spec.md\`
      - 添加 Purpose（目的）章节（可简短，标记为 TBD）
      - 添加 Requirements（需求）章节并包含 ADDED（新增）需求

4. **显示摘要**

   应用所有变更后，进行总结：
   - 更新了哪些功能模块
   - 进行了哪些变更（需求新增/修改/移除/重命名）

**增量规范格式参考**

\`\`\`markdown
## ADDED Requirements

### Requirement: New Feature
The system SHALL do something new.

#### Scenario: Basic case
- **WHEN** user does X
- **THEN** system does Y

## MODIFIED Requirements

### Requirement: Existing Feature
#### Scenario: New scenario to add
- **WHEN** user does A
- **THEN** system does B

## REMOVED Requirements

### Requirement: Deprecated Feature

## RENAMED Requirements

- FROM: \`### Requirement: Old Name\`
- TO: \`### Requirement: New Name\`
\`\`\`

**核心原则：智能合并**

与程序化合并不同，你可以应用**局部更新**：
- 若要添加场景，只需在 MODIFIED 下包含该场景即可——无需复制现有场景
- 增量代表的是*意图*，而非整体替换
- 运用你的判断力合理合并变更

**成功时的输出**

\`\`\`
## Specs Synced: <change-name>

Updated main specs:

**<capability-1>**:
- Added requirement: "New Feature"
- Modified requirement: "Existing Feature" (added 1 scenario)

**<capability-2>**:
- Created new spec file
- Added requirement: "Another Feature"

Main specs are now updated. The change remains active - archive when implementation is complete.
\`\`\`

**安全准则**
- 在进行变更前，同时阅读增量规范和主规范
- 保留增量中未提及的现有内容
- 若有不明确之处，请求澄清
- 逐步展示你正在进行的变更
- 操作应具备幂等性——执行两次应得到相同结果`,
  };
}
