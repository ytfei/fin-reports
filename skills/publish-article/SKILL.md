---
name: publish-article
title: 发布 HTML 文章到 fin-reports
description: 自动解析 HTML 文章元数据，生成规范文件名，复制到目标分类目录，触发构建并部署
---

# publish-article

自动化发布 HTML 文章到 fin-reports 项目的 Skill。

## 功能

1. **解析 HTML**：自动提取文章标题、日期和分类
2. **文件命名**：根据日期和标题生成规范的文件名 (YYYY-MM-DD-title.html)
3. **复制文件**：将文章复制到目标分类目录 (articles/{category}/)
4. **自动构建**：触发项目的构建脚本生成首页和分类页面
5. **一键部署**：发布到 Cloudflare Pages

## 使用场景

- 当你有一个写好的 HTML 文章需要发布到 fin-reports 项目时
- 当你想要自动化文件复制、重命名、构建、部署整个流程时
- 当你想要确保文件命名符合项目规范时

## 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `sourcePath` | string | 是 | 源 HTML 文件路径 |
| `category` | string | 否 | 目标分类目录，默认自动检测 |
| `date` | string | 否 | 发布日期 (YYYY-MM-DD)，默认今天 |
| `skipDeploy` | boolean | 否 | 跳过部署，仅构建 |
| `dryRun` | boolean | 否 | 预览模式，不执行实际操作 |

## 支持的分类

- `market-analysis` - 市场分析
- `industry-research` - 行业研究
- `company-reports` - 公司报告
- `AI-daily` - AI 日报

## 示例

```bash
# 基本用法 - 自动检测分类
publish-article ~/Downloads/article.html

# 指定分类
publish-article ~/Downloads/article.html --category AI-daily

# 指定发布日期
publish-article ~/Downloads/article.html --date 2026-06-26

# 跳过部署（仅构建）
publish-article ~/Downloads/article.html --skip-deploy

# 预览模式
publish-article ~/Downloads/article.html --dry-run
```

## 返回值

成功时返回包含以下信息的对象：

```typescript
{
  success: true,
  article: { title, date, category, filename, path, url },
  build: { outputDir, articleCount, categoryCounts },
  deploy: { url, deploymentId }
}
```

## 技术细节

- **标题提取优先级**: `<title>` → `<h1>` → `og:title` → 文件名
- **日期提取优先级**: `<meta name="date">` → title 中的日期模式 → 当前日期
- **分类检测**: `<meta name="category">` → 内容关键词 → 手动指定
- **文件命名**: 特殊字符会被清理，保留中文、英文、数字、连字符
- **回滚机制**: 构建或部署失败时自动回滚文件操作
