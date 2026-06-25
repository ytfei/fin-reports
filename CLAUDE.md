# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Cloudflare Pages 的静态金融分析文章网站，使用自定义 Node.js 构建脚本自动生成首页和分类页面。

**核心架构**：`src/build.js` 是整个项目的构建引擎，负责扫描文章、提取元数据、生成 HTML。

## 常用命令

```bash
# 构建网站
npm run build

# 本地预览（构建后启动 HTTP 服务器）
npm run dev

# 部署到 Cloudflare Pages
npm run deploy

# 验证构建完整性
npm run verify
```

## 构建系统架构

`src/build.js` 是项目核心，包含以下关键函数：

| 函数 | 作用 |
|------|------|
| `scanArticles()` | 扫描 `articles/` 目录，提取所有文章元数据 |
| `extractMetadata()` | 从 HTML 文件中提取 title、date、description |
| `generateIndex()` | 生成首页 HTML（包含分类导航和文章列表） |
| `generateCategoryPage()` | 为每个分类生成独立的列表页面 |
| `generateSitemap()` | 生成 SEO sitemap.xml |
| `build()` | 主入口，协调整个构建流程 |

**文章元数据来源**（优先级从高到低）：
1. `<meta name="date" content="...">`
2. 文件名中的日期前缀（`YYYY-MM-DD-title.html`）
3. 默认值 `2024-01-01`

## 文章格式要求

文件命名格式：`YYYY-MM-DD-title.html`

HTML `<head>` 必须包含：
```html
<title>文章标题</title>
<meta name="date" content="2024-04-26">
<meta name="description" content="文章摘要">
```

## 分类系统

文章存储在 `articles/{category}/` 目录下。添加新分类需要两步：

1. 在 `articles/` 下创建新目录
2. 在 `src/build.js` 的 `getCategoryDisplayName()` 函数中添加显示名称映射

当前分类：
- `market-analysis` → 市场分析
- `industry-research` → 行业研究
- `company-reports` → 公司报告

## 部署流程

```
1. 编辑文章 → articles/*/*.html
2. Git 提交 → 触发 pre-commit hook 自动构建
3. 手动部署 → npm run deploy
4. Cloudflare Pages → fin.a11.world
```

部署使用 `wrangler pages deploy`，项目配置在 `wrangler.toml` 中。

## 目录结构

```
fin-reports/
├── articles/              # 文章源文件（不直接发布）
│   ├── market-analysis/
│   ├── industry-research/
│   └── company-reports/
├── public/                # 构建输出（自动生成，可删除）
│   ├── index.html         # 首页
│   ├── articles/          # 文章副本 + 分类索引页
│   └── sitemap.xml        # SEO sitemap
├── src/
│   └── build.js           # 核心构建脚本
├── scripts/               # 辅助脚本
└── wrangler.toml         # Cloudflare 配置
```

## 注意事项

- `public/` 目录完全由构建脚本生成，可以随时删除重新构建
- 首页文章按日期倒序排列（最新在前）
- 每个分类目录会自动生成 `index.html` 作为分类列表页
- 部署前建议运行 `npm run verify` 验证构建完整性
