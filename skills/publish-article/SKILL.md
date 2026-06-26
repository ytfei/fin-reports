---
name: publish-article
title: 发布 HTML 文章到 fin-reports
description: 完整的文章发布自动化流程：解析元数据、复制文件、git 提交、构建、部署
version: 2.0.0
triggers:
  - 发布文章
  - 发布 HTML
  - 上传文章
  - 添加文章
  - publish article
  - 部署文章
---

# publish-article

完整自动化发布 HTML 文章到 fin-reports 项目的 Skill。

## 功能流程

```
源 HTML 文件
    ↓
1. 解析元数据 (title, date, category)
    ↓
2. 生成规范文件名 (YYYY-MM-DD-title.html)
    ↓
3. 复制到 articles/{category}/
    ↓
4. git add + git commit + git push
    ↓
5. npm run build (生成首页和分类页)
    ↓
6. wrangler pages deploy
    ↓
发布完成 ✅
```

## 使用方式

### 方式一：直接调用 Skill

```
给定任何一个 HTML 文件路径，自动完成：
- 解析文章元数据
- 复制到对应分类目录
- Git 提交并推送
- 构建项目
- 部署到 Cloudflare Pages
```

### 方式二：命令行

```bash
# 基本用法 - 自动检测分类并完成全流程
npx publish-article ~/Downloads/article.html

# 指定分类
npx publish-article ~/Downloads/article.html --category AI-daily

# 指定发布日期
npx publish-article ~/Downloads/article.html --date 2026-06-26

# 跳过部署（仅本地构建）
npx publish-article ~/Downloads/article.html --skip-deploy

# 预览模式（不执行实际操作）
npx publish-article ~/Downloads/article.html --dry-run
```

## 参数说明

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `sourcePath` | string | 是 | 源 HTML 文件路径（支持 `~` 缩写） |
| `category` | string | 否 | 目标分类，默认自动检测 |
| `date` | string | 否 | 发布日期 YYYY-MM-DD，默认今天 |
| `commitMessage` | string | 否 | Git 提交消息，默认自动生成 |
| `projectPath` | string | 否 | fin-reports 项目路径，默认自动检测 |
| `skipDeploy` | boolean | 否 | 跳过部署，仅构建 |
| `dryRun` | boolean | 否 | 预览模式，不执行实际操作 |
| `verbose` | boolean | 否 | 详细输出 |

## 项目路径检测

Skill 会按以下优先级查找 fin-reports 项目：

1. **参数指定**: `--project-path /path/to/fin-reports`
2. **环境变量**: `FIN_REPORTS_PATH=/path/to/fin-reports`
3. **配置文件**: `~/.fin-reports/config.json` 中设置 `projectPath`
4. **自动搜索**: 常见位置（当前目录、上级目录、`~/codebase/` 等）

### 配置文件示例

创建 `~/.fin-reports/config.json`:

```json
{
  "projectPath": "/Users/mason/codebase/NexTech/fin-reports"
}
```

## 支持的分类

| 目录 | 显示名称 | 说明 |
|------|----------|------|
| `market-analysis` | 市场分析 | 市场趋势、行情分析 |
| `industry-research` | 行业研究 | 行业深度研究报告 |
| `company-reports` | 公司报告 | 公司财报、研报 |
| `AI-daily` | AI 日报 | AI 行业日报 |

## 元数据格式

HTML 文件应在 `<head>` 中包含以下元数据：

```html
<head>
  <title>文章标题</title>
  <meta name="date" content="2026-06-26">
  <meta name="description" content="文章摘要">
  <meta name="category" content="market-analysis">
</head>
```

### 提取优先级

- **标题**: `<title>` → `<h1>` → `og:title` → 文件名
- **日期**: `<meta name="date">` → title 中的日期模式 → 当前日期
- **分类**: `<meta name="category">` → 内容关键词 → 手动指定

## Git 提交规则

自动生成的提交消息格式：

```
add report: {title}

Date: {date}
Category: {category}
File: {filename}
```

## 文件命名规则

格式：`YYYY-MM-DD-{sanitized-title}.html`

- 标题中的特殊字符会被清理
- 保留中文、英文、数字、连字符
- 过长的标题会被截断

## 执行示例

```bash
$ npx publish-article ~/Downloads/英伟达800V架构产业链深度分析.html

📝 文章发布自动化 Skill
═══════════════════════════════════════════════════════════════
📂 源文件: ~/Downloads/英伟达800V架构产业链深度分析.html

🔍 解析中...
   ✅ 标题: 英伟达800V架构产业链深度分析_BOM拆解与受益标的
   ✅ 日期: 2026-06-25
   ✅ 分类: company-reports

📝 文件信息
   文件名: 2026-06-25-英伟达800V架构产业链深度分析.html
   目标路径: /Users/mason/codebase/NexTech/fin-reports/articles/company-reports/2026-06-25-英伟达800V架构产业链深度分析.html
   访问 URL: https://fin.a11.world/articles/company-reports/2026-06-25-英伟达800V架构产业链深度分析.html

📄 复制文件...
✅ 文件已复制

🔧 Git 提交中...
   [main 8a3f2b1] add report: 英伟达800V架构产业链深度分析
    1 file changed, 0 insertions(+), 0 deletions(-)
✅ Git 推送成功

🔨 开始构建...
扫描到 5 篇文章
- market-analysis: 2 篇
- company-reports: 2 篇
- industry-research: 1 篇
✅ 构建成功

🚀 部署中...
✅ 部署成功

═══════════════════════════════════════════════════════════════
✨ 文章发布成功！已部署到 https://fin.a11.world

📊 统计:
   • 总文章数: 5
   • market-analysis: 2 篇
   • company-reports: 2 篇
   • industry-research: 1 篇

🌐 访问: https://fin.a11.world/articles/company-reports/2026-06-25-英伟达800V架构产业链深度分析.html
```

## 返回值

成功时返回：

```typescript
{
  success: true,
  article: {
    title: string,
    date: string,
    category: string,
    filename: string,
    path: string,
    url: string
  },
  git: {
    committed: true,
    commitHash: string,
    pushed: boolean
  },
  build: {
    success: true,
    outputDir: string,
    articleCount: number,
    categoryCounts: Record<string, number>
  },
  deploy: {
    success: true,
    url: string,
    deploymentId?: string
  },
  summary: string
}
```

## 错误处理

每个步骤都有独立的错误处理和回滚机制：

- **解析失败**: 返回详细错误信息，不执行后续操作
- **复制失败**: 自动清理已复制的文件
- **Git 失败**: 提示用户手动处理
- **构建失败**: 保留文件，提示构建错误
- **部署失败**: 构建产物保留，可重试部署

## 项目结构

```
fin-reports/
├── articles/              # 文章源文件（不直接发布）
│   ├── market-analysis/
│   ├── industry-research/
│   ├── company-reports/
│   └── AI-daily/
├── public/                # 构建输出（自动生成）
│   ├── index.html         # 首页
│   ├── articles/          # 文章副本 + 分类索引页
│   └── sitemap.xml        # SEO sitemap
├── src/
│   └── build.js           # 核心构建脚本
└── skills/
    └── publish-article/   # 本 skill
```

## 相关命令

```bash
# 本地预览构建结果
npm run dev

# 验证构建完整性
npm run verify

# 仅构建不部署
npm run build

# 构建并部署
npm run deploy
```
