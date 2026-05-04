/**
 * 技能模板工作流模块
 *
 * 此文件由将旧版单体模板文件拆分为以工作流为中心的模块生成。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getNewChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-new-change',
    description:
      '使用实验性制品工作流开始一个新的 OpenSpec 变更。当用户希望通过结构化的分步方法创建新功能、修复或修改时使用。',
    instructions: `使用实验性的制品驱动方法开始新的变更。

**输入**：用户的请求应包含变更名称（kebab-case 格式）或他们想要构建的内容的描述。

**步骤**

1. **如果未提供明确的输入，请询问他们想要构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）提问：
   > "您想进行什么变更？描述一下您想要构建或修复的内容。"

   根据他们的描述，推导出 kebab-case 格式的名称（例如，"add user authentication" → \`add-user-auth\`）。

   **重要提示**：在未明确了解用户想要构建的内容之前，切勿继续执行。

2. **确定工作流模式（schema）**

   除非用户明确要求使用不同的工作流，否则使用默认模式（省略 \`--schema\`）。

   **仅在用户提及以下内容时使用不同的模式：**
   - 特定的模式名称 → 使用 \`--schema <name>\`
   - "show workflows" 或 "what workflows" → 运行 \`openspec schemas --json\` 并让他们选择

   **否则**：省略 \`--schema\` 以使用默认模式。

3. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   仅当用户请求特定工作流时才添加 \`--schema <name>\`。
   这将在 \`openspec/changes/<name>/\` 处创建一个使用所选模式构建的变更脚手架。

4. **显示制品状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`
   这将显示哪些制品需要创建，哪些已就绪（依赖关系已满足）。

5. **获取首个制品的说明**
   首个制品取决于所选模式（例如，规范驱动模式下的 \`proposal\`）。
   检查状态输出，找到状态为 "ready"（就绪）的第一个制品。
   \`\`\`bash
   openspec instructions <first-artifact-id> --change "<name>"
   \`\`\`
   这将输出创建首个制品所需的模板和上下文。

6. **停止并等待用户指示**

**输出**

完成上述步骤后，进行总结：
- 变更名称及位置
- 正在使用的模式/工作流及其制品序列
- 当前状态（已完成 0/N 个制品）
- 首个制品的模板
- 提示语："准备好创建首个制品了吗？只需描述此变更的大致内容，我将为您起草，或者请让我继续。"

**约束条件（Guardrails）**
- 切勿立即创建任何制品 - 仅展示说明
- 切勿在展示首个制品模板后继续推进
- 如果名称无效（非 kebab-case 格式），请要求提供有效名称
- 如果已存在同名变更，建议继续该变更
- 如果使用非默认工作流，请传递 --schema 参数`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxNewCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: New',
    description: '使用实验性制品工作流开始新的变更（OPSX）',
    category: '工作流',
    tags: ['工作流', '制品', '实验性'],
    content: `使用实验性的制品驱动方法开始新的变更。

**输入**：\`/opsx:new\` 之后的参数为变更名称（kebab-case 格式），或用户想要构建的内容的描述。

**步骤**

1. **如果未提供输入，请询问他们想要构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）提问：
   > "您想进行什么变更？描述一下您想要构建或修复的内容。"

   根据他们的描述，推导出 kebab-case 格式的名称（例如，"add user authentication" → \`add-user-auth\`）。

   **重要提示**：在未明确了解用户想要构建的内容之前，切勿继续执行。

2. **确定工作流模式（schema）**

   除非用户明确要求使用不同的工作流，否则使用默认模式（省略 \`--schema\`）。

   **仅在用户提及以下内容时使用不同的模式：**
   - 特定的模式名称 → 使用 \`--schema <name>\`
   - "show workflows" 或 "what workflows" → 运行 \`openspec schemas --json\` 并让他们选择

   **否则**：省略 \`--schema\` 以使用默认模式。

3. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   仅当用户请求特定工作流时才添加 \`--schema <name>\`。
   这将在 \`openspec/changes/<name>/\` 处创建一个使用所选模式构建的变更脚手架。

4. **显示制品状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`
   这将显示哪些制品需要创建，哪些已就绪（依赖关系已满足）。

5. **获取首个制品的说明**
   首个制品取决于所选模式。检查状态输出，找到状态为 "ready"（就绪）的第一个制品。
   \`\`\`bash
   openspec instructions <first-artifact-id> --change "<name>"
   \`\`\`
   这将输出创建首个制品所需的模板和上下文。

6. **停止并等待用户指示**

**输出**

完成上述步骤后，进行总结：
- 变更名称及位置
- 正在使用的模式/工作流及其制品序列
- 当前状态（已完成 0/N 个制品）
- 首个制品的模板
- 提示语："准备好创建首个制品了吗？运行 \`/opsx:continue\` 或只需描述此变更的大致内容，我将为您起草。"

**约束条件（Guardrails）**
- 切勿立即创建任何制品 - 仅展示说明
- 切勿在展示首个制品模板后继续推进
- 如果名称无效（非 kebab-case 格式），请要求提供有效名称
- 如果已存在同名变更，建议改用 \`/opsx:continue\`
- 如果使用非默认工作流，请传递 --schema 参数`,
  };
}
