---
name: publish-article
title: 发布 HTML 文章到 fin-reports
description: 使用 publish-article CLI 工具发布 HTML 文章到 fin-reports 项目
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

这是一个 **Skill 文档**，告诉 Agent 如何使用 `publish-article` CLI 工具。

## CLI 工具安装

CLI 工具位于 `cli/publish-article/`，需要先构建并安装：

```bash
cd cli/publish-article
npm install
npm run build
npm link
```

## 使用方式

当用户请求发布文章时，按以下步骤操作：

### 1. 确认参数

| 参数 | 说明 | 必填 |
|------|------|------|
| `sourcePath` | HTML 文件路径 | 是 |
| `category` | 分类目录 | 否 |
| `date` | 发布日期 YYYY-MM-DD | 否 |
| `message` | Git 提交消息 | 否 |
| `project-path` | fin-reports 项目路径 | 否 |

### 2. 执行命令

```bash
# 基本用法
publish-article ~/Downloads/article.html

# 指定分类
publish-article ~/Downloads/article.html --category AI-daily

# 指定项目路径
publish-article ~/Downloads/article.html --project-path /path/to/fin-reports

# 跳过部署
publish-article ~/Downloads/article.html --skip-deploy

# 预览模式
publish-article ~/Downloads/article.html --dry-run
```

### 3. 执行流程

CLI 工具会自动完成：

```
解析元数据 → 生成文件名 → 复制到 articles/ → git add/commit/push → npm run build → wrangler deploy
```

### 4. 返回结果

成功后会显示：
- 文章 URL
- Git commit hash
- 构建统计
- 部署状态

## 项目路径检测

CLI 会按优先级自动查找 fin-reports 项目：

1. `--project-path` 参数
2. `FIN_REPORTS_PATH` 环境变量
3. `~/.fin-reports/config.json` 配置文件
4. 自动搜索常见位置

## 支持的分类

- `market-analysis` - 市场分析
- `industry-research` - 行业研究
- `company-reports` - 公司报告
- `AI-daily` - AI 日报

## HTML 元数据格式

```html
<head>
  <title>文章标题</title>
  <meta name="date" content="2026-06-26">
  <meta name="description" content="文章摘要">
  <meta name="category" content="market-analysis">
</head>
```

## 示例对话

**用户**: 发布文章 ~/Downloads/xxx.html

**Agent 响应**:
```
📂 源文件: ~/Downloads/xxx.html
🔍 解析中...
   ✅ 标题: xxx
   ✅ 日期: 2026-06-26
   ✅ 分类: company-reports
📄 复制文件...
🔧 Git 提交...
🔨 构建...
🚀 部署...
✅ 文章发布成功！
```
