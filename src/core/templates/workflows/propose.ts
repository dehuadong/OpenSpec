/**
 * 技能模板工作流模块
 *
 * 此文件由将旧版单体模板文件拆分为以工作流为核心的模块生成。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getOpsxProposeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-propose',
    description:
      '一次性生成所有产物以提议一项新变更。当用户希望快速描述想要构建的内容，并获取包含设计、规范和任务、可直接投入实施的完整提案时使用。',
    instructions: `提议一项新变更 - 创建变更并一次性生成所有产物。

我将创建一个包含以下产物的变更：
- proposal.md（做什么及为什么做）
- design.md（如何做）
- tasks.md（实施步骤）

准备实施时，运行 /opsx:apply

---

**输入**：用户的请求应包含变更名称（kebab-case/短横线命名法）或对其想要构建内容的描述。

**步骤**

1. **如果未提供明确输入，请询问他们想要构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）提问：
   > “您希望进行哪项变更？请描述您想要构建或修复的内容。”

   根据他们的描述，推导出 kebab-case 名称（例如，"add user authentication" → \`add-user-auth\`）。

   **重要提示**：在未明确了解用户想要构建的内容之前，切勿继续。

2. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   这将在 \`openspec/changes/<name>/\` 处创建一个包含 \`.openspec.yaml\` 的脚手架变更。

3. **获取产物构建顺序**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 以获取：
   - \`applyRequires\`：实施前所需的产物 ID 数组（例如 \`["tasks"]\`）
   - \`artifacts\`：所有产物的列表，包含其状态和依赖关系

4. **按顺序创建产物，直至达到可应用状态**

   使用 **TodoWrite 工具**跟踪各项产物的进度。

   按依赖顺序遍历产物（优先处理无待处理依赖的产物）：

   a. **对于每个状态为 \`ready\`（依赖已满足）的产物**：
      - 获取指令：
        \`\`\`bash
        openspec instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - 该指令 JSON 包含：
        - \`context\`：项目背景（对你的约束条件 - **切勿**包含在输出中）
        - \`rules\`：特定于产物的规则（对你的约束条件 - **切勿**包含在输出中）
        - \`template\`：用于输出文件的结构模板
        - \`instruction\`：针对此产物类型的模式特定指导
        - \`outputPath\`：产物的写入路径
        - \`dependencies\`：用于获取上下文参考的已完成产物
      - 读取任何已完成的依赖文件以获取上下文
      - 使用 \`template\` 作为结构创建产物文件
      - 将 \`context\` 和 \`rules\` 作为约束条件应用 - 但**切勿**将它们复制到文件中
      - 显示简要进度：“已创建 <artifact-id>”

   b. **继续直至所有 \`applyRequires\` 产物均已完成**
      - 每创建一个产物后，重新运行 \`openspec status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中的每个产物 ID 在 artifacts 数组中是否都具有 \`status: "done"\`
      - 当所有 \`applyRequires\` 产物均完成时停止

   c. **如果某产物需要用户输入**（上下文不清晰）：
      - 使用 **AskUserQuestion 工具**进行澄清
      - 然后继续创建

5. **显示最终状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

完成所有产物后，进行总结：
- 变更名称和位置
- 已创建的产物列表及简要描述
- 就绪状态：“所有产物已创建！准备投入实施。”
- 提示：“运行 \`/opsx:apply\` 或要求我开始实施任务。”

**产物创建指南**

- 遵循 \`openspec instructions\` 中针对每种产物类型的 \`instruction\` 字段
- 模式（schema）定义了每个产物应包含的内容 - 请严格遵循
- 在创建新产物前，先读取依赖产物以获取上下文
- 使用 \`template\` 作为输出文件的结构 - 填充其各个部分
- **重要提示**：\`context\` 和 \`rules\` 是对**你**的约束条件，而非文件内容
  - **切勿**将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到产物中
  - 这些内容用于指导你的编写，但绝不应出现在输出中

**行为约束**
- 创建实施所需的**所有**产物（由模式的 \`apply.requires\` 定义）
- 在创建新产物前，务必先读取依赖产物
- 如果上下文极度不清晰，请向用户询问 - 但倾向于做出合理决策以保持进度
- 如果该名称的变更已存在，请询问用户是希望继续该变更还是创建新变更
- 在继续下一步之前，验证每个已写入的产物文件是否存在`,
    license: 'MIT',
    compatibility: '需要 openspec CLI。',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxProposeCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Propose',
    description: '提议一项新变更 - 创建变更并一次性生成所有产物',
    category: '工作流',
    tags: ['工作流', '产物', '实验性'],
    content: `提议一项新变更 - 创建变更并一次性生成所有产物。

我将创建一个包含以下产物的变更：
- proposal.md（做什么及为什么做）
- design.md（如何做）
- tasks.md（实施步骤）

准备实施时，运行 /opsx:apply

---

**输入**：\`/opsx:propose\` 之后的参数是变更名称（kebab-case），或对其想要构建内容的描述。

**步骤**

1. **如果未提供输入，请询问他们想要构建什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）提问：
   > “您希望进行哪项变更？请描述您想要构建或修复的内容。”

   根据他们的描述，推导出 kebab-case 名称（例如，"add user authentication" → \`add-user-auth\`）。

   **重要提示**：在未明确了解用户想要构建的内容之前，切勿继续。

2. **创建变更目录**
   \`\`\`bash
   openspec new change "<name>"
   \`\`\`
   这将在 \`openspec/changes/<name>/\` 处创建一个包含 \`.openspec.yaml\` 的脚手架变更。

3. **获取产物构建顺序**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   解析 JSON 以获取：
   - \`applyRequires\`：实施前所需的产物 ID 数组（例如 \`["tasks"]\`）
   - \`artifacts\`：所有产物的列表，包含其状态和依赖关系

4. **按顺序创建产物，直至达到可应用状态**

   使用 **TodoWrite 工具**跟踪各项产物的进度。

   按依赖顺序遍历产物（优先处理无待处理依赖的产物）：

   a. **对于每个状态为 \`ready\`（依赖已满足）的产物**：
      - 获取指令：
        \`\`\`bash
        openspec instructions <artifact-id> --change "<name>" --json
        \`\`\`
      - 该指令 JSON 包含：
        - \`context\`：项目背景（对你的约束条件 - **切勿**包含在输出中）
        - \`rules\`：特定于产物的规则（对你的约束条件 - **切勿**包含在输出中）
        - \`template\`：用于输出文件的结构模板
        - \`instruction\`：针对此产物类型的模式特定指导
        - \`outputPath\`：产物的写入路径
        - \`dependencies\`：用于获取上下文参考的已完成产物
      - 读取任何已完成的依赖文件以获取上下文
      - 使用 \`template\` 作为结构创建产物文件
      - 将 \`context\` 和 \`rules\` 作为约束条件应用 - 但**切勿**将它们复制到文件中
      - 显示简要进度：“已创建 <artifact-id>”

   b. **继续直至所有 \`applyRequires\` 产物均已完成**
      - 每创建一个产物后，重新运行 \`openspec status --change "<name>" --json\`
      - 检查 \`applyRequires\` 中的每个产物 ID 在 artifacts 数组中是否都具有 \`status: "done"\`
      - 当所有 \`applyRequires\` 产物均完成时停止

   c. **如果某产物需要用户输入**（上下文不清晰）：
      - 使用 **AskUserQuestion 工具**进行澄清
      - 然后继续创建

5. **显示最终状态**
   \`\`\`bash
   openspec status --change "<name>"
   \`\`\`

**输出**

完成所有产物后，进行总结：
- 变更名称和位置
- 已创建的产物列表及简要描述
- 就绪状态：“所有产物已创建！准备投入实施。”
- 提示：“运行 \`/opsx:apply\` 以开始实施。”

**产物创建指南**

- 遵循 \`openspec instructions\` 中针对每种产物类型的 \`instruction\` 字段
- 模式（schema）定义了每个产物应包含的内容 - 请严格遵循
- 在创建新产物前，先读取依赖产物以获取上下文
- 使用 \`template\` 作为输出文件的结构 - 填充其各个部分
- **重要提示**：\`context\` 和 \`rules\` 是对**你**的约束条件，而非文件内容
  - **切勿**将 \`<context>\`、\`<rules>\`、\`<project_context>\` 块复制到产物中
  - 这些内容用于指导你的编写，但绝不应出现在输出中

**行为约束**
- 创建实施所需的**所有**产物（由模式的 \`apply.requires\` 定义）
- 在创建新产物前，务必先读取依赖产物
- 如果上下文极度不清晰，请向用户询问 - 但倾向于做出合理决策以保持进度
- 如果该名称的变更已存在，请询问用户是希望继续该变更还是创建新变更
- 在继续下一步之前，验证每个已写入的产物文件是否存在`,
  };
}
