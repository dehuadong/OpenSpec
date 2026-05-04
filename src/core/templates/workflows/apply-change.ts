/**
 * 技能模板工作流模块
 *
 * 此文件由将旧版单体模板文件拆分为面向工作流的模块生成。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getApplyChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-apply-change',
    description:
      '实现 OpenSpec 变更中的任务。当用户希望开始实现、继续实现或逐步完成任务时使用。',
    instructions: `实现 OpenSpec 变更中的任务。

**输入**：可选指定变更名称。如果省略，请检查是否能从对话上下文中推断。如果表述模糊或存在歧义，你**必须**提示用户选择可用的变更。

**步骤**

1. **选择变更**

   如果提供了名称，则直接使用。否则：
   - 若用户在对话中提及变更，则从上下文中推断
   - 若仅存在一个活跃变更，则自动选择
   - 若存在歧义，运行 \`openspec list --json\` 获取可用变更，并使用 **AskUserQuestion 工具** 供用户选择

   始终声明：“正在使用变更：<name>”以及如何覆盖（例如，\`/opsx:apply <other>\`）。

2. **检查状态以了解工作流模式**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 以了解：
   - \`schemaName\`：当前使用的工作流模式（例如 "spec-driven"/规范驱动）
   - 哪个产物包含任务（规范驱动通常为 "tasks"，其他模式请检查状态输出）

3. **获取应用（apply）指令**

   \`\`\`bash
   openspec instructions apply --change "<name>" --json
   \`\`\`

   该命令返回：
   - 上下文文件路径（因模式而异 - 可能是 proposal/specs/design/tasks 或 spec/tests/implementation/docs）
   - 进度（总数、已完成、剩余）
   - 带状态的任务列表
   - 基于当前状态的动态指令

   **处理状态：**
   - 若 \`state: "blocked"\`（缺少产物）：显示提示信息，建议使用 openspec-continue-change
   - 若 \`state: "all_done"\`：表示祝贺，建议归档
   - 否则：继续执行实现

4. **读取上下文文件**

   读取应用指令输出中 \`contextFiles\` 列出的文件。
   具体文件取决于所使用的模式：
   - **spec-driven（规范驱动）**：proposal, specs, design, tasks
   - 其他模式：遵循 CLI 输出中的 contextFiles

5. **显示当前进度**

   显示：
   - 当前使用的模式
   - 进度："N/M 项任务已完成"
   - 剩余任务概览
   - 来自 CLI 的动态指令

6. **实现任务（循环执行直到完成或受阻）**

   对于每个待处理的任务：
   - 显示当前正在处理的任务
   - 进行所需的代码更改
   - 保持更改尽可能精简且专注
   - 在任务文件中标记该任务为完成：\`- [ ]\` → \`- [x]\`
   - 继续下一个任务

   **暂停条件：**
   - 任务不明确 → 请求澄清
   - 实现过程中发现设计问题 → 建议更新产物
   - 遇到错误或阻碍 → 报告并等待指导
   - 用户中断

7. **完成或暂停时，显示状态**

   显示：
   - 本次会话完成的任务
   - 总体进度："N/M 项任务已完成"
   - 若全部完成：建议归档
   - 若暂停：解释原因并等待指导

**实现过程中的输出**

\`\`\`
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
\`\`\`

**完成时的输出**

\`\`\`
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! Ready to archive this change.
\`\`\`

**暂停时的输出（遇到问题）**

\`\`\`
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
\`\`\`

**行为准则**
- 持续执行任务，直到完成或受阻
- 开始前务必读取上下文文件（来自 apply 指令输出）
- 若任务存在歧义，实现前先暂停并询问
- 若实现过程中发现问题，暂停并建议更新产物
- 保持代码更改精简，并限定在每个任务范围内
- 完成每个任务后，立即更新任务复选框
- 遇到错误、阻碍或需求不明确时暂停 - 不要猜测
- 使用 CLI 输出中的 contextFiles，不要假设特定的文件名

**灵活工作流集成**

该技能支持“针对变更执行操作”的模式：

- **可随时调用**：在所有产物完成之前（如果已有任务）、部分实现之后，或与其他操作交替执行
- **允许更新产物**：若实现过程中发现设计问题，建议更新产物 - 不强制阶段锁定，保持灵活协作`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxApplyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Apply',
    description: '实现 OpenSpec 变更中的任务（实验性）',
    category: '工作流',
    tags: ['工作流', '产物', '实验性'],
    content: `实现 OpenSpec 变更中的任务。

**输入**：可选指定变更名称（例如，\`/opsx:apply add-auth\`）。如果省略，请检查是否能从对话上下文中推断。如果表述模糊或存在歧义，你**必须**提示用户选择可用的变更。

**步骤**

1. **选择变更**

   如果提供了名称，则直接使用。否则：
   - 若用户在对话中提及变更，则从上下文中推断
   - 若仅存在一个活跃变更，则自动选择
   - 若存在歧义，运行 \`openspec list --json\` 获取可用变更，并使用 **AskUserQuestion 工具** 供用户选择

   始终声明：“正在使用变更：<name>”以及如何覆盖（例如，\`/opsx:apply <other>\`）。

2. **检查状态以了解工作流模式**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 以了解：
   - \`schemaName\`：当前使用的工作流模式（例如 "spec-driven"/规范驱动）
   - 哪个产物包含任务（规范驱动通常为 "tasks"，其他模式请检查状态输出）

3. **获取应用（apply）指令**

   \`\`\`bash
   openspec instructions apply --change "<name>" --json
   \`\`\`

   该命令返回：
   - 上下文文件路径（因模式而异）
   - 进度（总数、已完成、剩余）
   - 带状态的任务列表
   - 基于当前状态的动态指令

   **处理状态：**
   - 若 \`state: "blocked"\`（缺少产物）：显示提示信息，建议使用 \`/opsx:continue\`
   - 若 \`state: "all_done"\`：表示祝贺，建议归档
   - 否则：继续执行实现

4. **读取上下文文件**

   读取应用指令输出中 \`contextFiles\` 列出的文件。
   具体文件取决于所使用的模式：
   - **spec-driven（规范驱动）**：proposal, specs, design, tasks
   - 其他模式：遵循 CLI 输出中的 contextFiles

5. **显示当前进度**

   显示：
   - 当前使用的模式
   - 进度："N/M 项任务已完成"
   - 剩余任务概览
   - 来自 CLI 的动态指令

6. **实现任务（循环执行直到完成或受阻）**

   对于每个待处理的任务：
   - 显示当前正在处理的任务
   - 进行所需的代码更改
   - 保持更改尽可能精简且专注
   - 在任务文件中标记该任务为完成：\`- [ ]\` → \`- [x]\`
   - 继续下一个任务

   **暂停条件：**
   - 任务不明确 → 请求澄清
   - 实现过程中发现设计问题 → 建议更新产物
   - 遇到错误或阻碍 → 报告并等待指导
   - 用户中断

7. **完成或暂停时，显示状态**

   显示：
   - 本次会话完成的任务
   - 总体进度："N/M 项任务已完成"
   - 若全部完成：建议归档
   - 若暂停：解释原因并等待指导

**实现过程中的输出**

\`\`\`
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
\`\`\`

**完成时的输出**

\`\`\`
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

所有任务已完成！你可以使用 \`/opsx:archive\` 归档此变更。
\`\`\`

**暂停时的输出（遇到问题）**

\`\`\`
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
\`\`\`

**行为准则**
- 持续执行任务，直到完成或受阻
- 开始前务必读取上下文文件（来自 apply 指令输出）
- 若任务存在歧义，实现前先暂停并询问
- 若实现过程中发现问题，暂停并建议更新产物
- 保持代码更改精简，并限定在每个任务范围内
- 完成每个任务后，立即更新任务复选框
- 遇到错误、阻碍或需求不明确时暂停 - 不要猜测
- 使用 CLI 输出中的 contextFiles，不要假设特定的文件名

**灵活工作流集成**

该技能支持“针对变更执行操作”的模式：

- **可随时调用**：在所有产物完成之前（如果已有任务）、部分实现之后，或与其他操作交替执行
- **允许更新产物**：若实现过程中发现设计问题，建议更新产物 - 不强制阶段锁定，保持灵活协作`,
  };
}
