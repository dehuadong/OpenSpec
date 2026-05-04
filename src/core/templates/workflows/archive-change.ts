/**
 * 技能模板工作流模块
 *
 * 此文件由将旧版单体模板文件拆分为以工作流为中心的模块生成。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getArchiveChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-archive-change',
    description:
      '在实验性工作流中归档已完成的变更。当用户希望在实现完成后最终确定并归档变更时使用。',
    instructions: `归档实验性工作流中已完成的变更。

**输入**：可选地指定变更名称。如果省略，请检查是否可以从对话上下文中推断。如果表述模糊或模棱两可，您必须提示用户选择可用的变更。

**步骤**

1. **如果未提供变更名称，提示进行选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具** 让用户进行选择。

   仅显示活跃的变更（尚未归档的）。
   如果可用，请包含每个变更所使用的模式（schema）。

   **重要**：切勿猜测或自动选择变更。始终让用户自行选择。

2. **检查工件完成状态**

   运行 \`openspec status --change "<name>" --json\` 检查工件完成情况。

   解析 JSON 以了解：
   - \`schemaName\`：使用的工作流
   - \`artifacts\`：工件列表及其状态（\`done\` 或其他）

   **如果任何工件未标记为 \`done\`：**
   - 显示警告并列出未完成的工件
   - 使用 **AskUserQuestion 工具** 确认用户是否希望继续
   - 若用户确认则继续

3. **检查任务完成状态**

   读取任务文件（通常为 \`tasks.md\`）以检查未完成的任务。

   统计标记为 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）的任务数量。

   **如果发现未完成的任务：**
   - 显示警告并提示未完成的任务数量
   - 使用 **AskUserQuestion 工具** 确认用户是否希望继续
   - 若用户确认则继续

   **如果不存在任务文件：** 直接继续，无需发出与任务相关的警告。

4. **评估增量规范同步状态**

   检查 \`openspec/changes/<name>/specs/\` 下是否存在增量规范。如果不存在，则无需提示同步，直接继续。

   **如果存在增量规范：**
   - 将每个增量规范与其在 \`openspec/specs/<capability>/spec.md\` 对应的主规范进行比较
   - 确定将应用哪些变更（新增、修改、删除、重命名）
   - 在提示之前显示综合摘要

   **提示选项：**
   - 如果需要变更：“立即同步（推荐）”、“不同步直接归档”
   - 如果已同步：“立即归档”、“仍然同步”、“取消”

   如果用户选择同步，请使用 Task 工具（subagent_type: "general-purpose", prompt: "使用 Skill 工具为变更 '<name>' 调用 openspec-sync-specs。增量规范分析：<包含分析后的增量规范摘要>"）。无论用户作何选择，均继续执行归档。

5. **执行归档**

   如果归档目录不存在则创建：
   \`\`\`bash
   mkdir -p openspec/changes/archive
   \`\`\`

   使用当前日期生成目标名称：\`YYYY-MM-DD-<change-name>\`

   **检查目标是否已存在：**
   - 如果存在：报错失败，建议重命名现有归档或使用其他日期
   - 如果不存在：将变更目录移动到归档目录

   \`\`\`bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

6. **显示摘要**

   显示归档完成摘要，包括：
   - 变更名称
   - 使用的模式
   - 归档位置
   - 规范是否已同步（如适用）
   - 关于任何警告的说明（未完成的工件/任务）

**成功时输出**

\`\`\`
## 归档完成

**变更：** <change-name>
**模式：** <schema-name>
**已归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** ✓ 已同步至主规范（或“无增量规范”或“已跳过同步”）

所有工件已完成。所有任务已完成。
\`\`\`

**行为约束**
- 如果未提供，始终提示选择变更
- 使用工件图（openspec status --json）进行完成状态检查
- 不要因警告而阻止归档——仅告知并确认即可
- 移动到归档时保留 .openspec.yaml（它会随目录一起移动）
- 清晰展示操作摘要
- 如果请求同步，请使用 openspec-sync-specs 方法（由代理驱动）
- 如果存在增量规范，始终运行同步评估并在提示前显示综合摘要`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxArchiveCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Archive',
    description: '在实验性工作流中归档已完成的变更',
    category: '工作流',
    tags: ['workflow', 'archive', 'experimental'],
    content: `在实验性工作流中归档已完成的变更。

**输入**：在 \`/opsx:archive\` 后可选地指定变更名称（例如，\`/opsx:archive add-auth\`）。如果省略，请检查是否可以从对话上下文中推断。如果表述模糊或模棱两可，您必须提示用户选择可用的变更。

**步骤**

1. **如果未提供变更名称，提示进行选择**

   运行 \`openspec list --json\` 获取可用变更。使用 **AskUserQuestion 工具** 让用户进行选择。

   仅显示活跃的变更（尚未归档的）。
   如果可用，请包含每个变更所使用的模式（schema）。

   **重要**：切勿猜测或自动选择变更。始终让用户自行选择。

2. **检查工件完成状态**

   运行 \`openspec status --change "<name>" --json\` 检查工件完成情况。

   解析 JSON 以了解：
   - \`schemaName\`：使用的工作流
   - \`artifacts\`：工件列表及其状态（\`done\` 或其他）

   **如果任何工件未标记为 \`done\`：**
   - 显示警告并列出未完成的工件
   - 提示用户确认是否继续
   - 若用户确认则继续

3. **检查任务完成状态**

   读取任务文件（通常为 \`tasks.md\`）以检查未完成的任务。

   统计标记为 \`- [ ]\`（未完成）与 \`- [x]\`（已完成）的任务数量。

   **如果发现未完成的任务：**
   - 显示警告并提示未完成的任务数量
   - 提示用户确认是否继续
   - 若用户确认则继续

   **如果不存在任务文件：** 直接继续，无需发出与任务相关的警告。

4. **评估增量规范同步状态**

   检查 \`openspec/changes/<name>/specs/\` 下是否存在增量规范。如果不存在，则无需提示同步，直接继续。

   **如果存在增量规范：**
   - 将每个增量规范与其在 \`openspec/specs/<capability>/spec.md\` 对应的主规范进行比较
   - 确定将应用哪些变更（新增、修改、删除、重命名）
   - 在提示之前显示综合摘要

   **提示选项：**
   - 如果需要变更：“立即同步（推荐）”、“不同步直接归档”
   - 如果已同步：“立即归档”、“仍然同步”、“取消”

   如果用户选择同步，请使用 Task 工具（subagent_type: "general-purpose", prompt: "使用 Skill 工具为变更 '<name>' 调用 openspec-sync-specs。增量规范分析：<包含分析后的增量规范摘要>"）。无论用户作何选择，均继续执行归档。

5. **执行归档**

   如果归档目录不存在则创建：
   \`\`\`bash
   mkdir -p openspec/changes/archive
   \`\`\`

   使用当前日期生成目标名称：\`YYYY-MM-DD-<change-name>\`

   **检查目标是否已存在：**
   - 如果存在：报错失败，建议重命名现有归档或使用其他日期
   - 如果不存在：将变更目录移动到归档目录

   \`\`\`bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

6. **显示摘要**

   显示归档完成摘要，包括：
   - 变更名称
   - 使用的模式
   - 归档位置
   - 规范同步状态（已同步 / 跳过同步 / 无增量规范）
   - 关于任何警告的说明（未完成的工件/任务）

**成功时输出**

\`\`\`
## 归档完成

**变更：** <change-name>
**模式：** <schema-name>
**已归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** ✓ 已同步至主规范

所有工件已完成。所有任务已完成。
\`\`\`

**成功时输出（无增量规范）**

\`\`\`
## 归档完成

**变更：** <change-name>
**模式：** <schema-name>
**已归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** 无增量规范

所有工件已完成。所有任务已完成。
\`\`\`

**成功时输出（含警告）**

\`\`\`
## 归档完成（含警告）

**变更：** <change-name>
**模式：** <schema-name>
**已归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**规范：** 同步已跳过（用户选择跳过）

**警告：**
- 归档时包含 2 个未完成的工件
- 归档时包含 3 个未完成的任务
- 增量规范同步已跳过（用户选择跳过）

如果此操作非有意为之，请检查归档内容。
\`\`\`

**错误时输出（归档已存在）**

\`\`\`
## 归档失败

**变更：** <change-name>
**目标：** openspec/changes/archive/YYYY-MM-DD-<name>/

目标归档目录已存在。

**选项：**
1. 重命名现有归档
2. 如果现有归档是重复的，请将其删除
3. 等待至其他日期再进行归档
\`\`\`

**行为约束**
- 如果未提供，始终提示选择变更
- 使用工件图（openspec status --json）进行完成状态检查
- 不要因警告而阻止归档——仅告知并确认即可
- 移动到归档时保留 .openspec.yaml（它会随目录一起移动）
- 清晰展示操作摘要
- 如果请求同步，请使用 Skill 工具调用 \`openspec-sync-specs\`（由代理驱动）
- 如果存在增量规范，始终运行同步评估并在提示前显示综合摘要`,
  };
}
