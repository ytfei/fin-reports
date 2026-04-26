# 金融分析文章网站 | fin.a11.world

> 自动化金融分析报告发布平台

## 📋 项目概述

这是一个基于 Cloudflare Pages 的静态网站，用于汇集和展示金融分析文章。网站结构简洁，发布流程自动化。

### 核心特性

- ✅ **自动生成首页**：扫描文章目录，自动生成索引页面
- ✅ **分类管理**：文章按分类组织，支持筛选
- ✅ **时间排序**：首页按发布时间倒序展示
- ✅ **响应式设计**：支持桌面和移动设备
- ✅ **Git 工作流**：添加文章后自动构建
- ✅ **一键部署**：Wrangler 快速发布

## 📁 目录结构

```
fin-reports/
├── articles/                    # 文章源文件（不发布）
│   ├── market-analysis/        # 市场分析
│   ├── industry-research/      # 行业研究
│   └── company-reports/        # 公司报告
├── public/                      # 构建输出（自动生成）
│   ├── index.html             # 首页
│   └── articles/              # 文章副本
├── src/
│   └── build.js               # 构建脚本
├── scripts/
│   └── deploy.sh              # 发布脚本
├── wrangler.toml              # Cloudflare 配置
└── package.json
```

## 🚀 快速开始

### 1. 添加新文章

```bash
# 复制模板
cp articles/article-template.html articles/market-analysis/2024-04-26-your-article.html

# 编辑文章
vim articles/market-analysis/2024-04-26-your-article.html
```

### 2. 文章格式要求

文件名格式：`YYYY-MM-DD-title.html`

HTML `<head>` 中需包含：
```html
<meta name="date" content="2024-04-26">
<meta name="description" content="文章摘要">
<title>文章标题</title>
```

### 3. 提交并发布

```bash
# Git 提交（会自动触发构建）
git add articles/
git commit -m "feat: 添加新文章"

# 发布到 Cloudflare Pages
npm run deploy

# 或使用 Wrangler 直接部署
wrangler pages deploy public --project-name=fin-reports
```

## 🔧 本地开发

```bash
# 安装依赖（如果需要）
npm install

# 构建网站
npm run build

# 本地预览
npm run dev
# 访问 http://localhost:3000
```

## 📊 工作流程

```
1. 编辑文章 (articles/*/*.html)
       ↓
2. Git 提交 (触发 pre-commit hook)
       ↓
3. 自动构建 (npm run build)
       ↓
4. 生成首页 (public/index.html)
       ↓
5. 部署 (wrangler pages deploy)
       ↓
6. CDN 分发 (fin.a11.world)
```

## 🎨 自定义配置

### 添加新分类

1. 在 `articles/` 下创建新目录：
```bash
mkdir articles/new-category
```

2. 在 `src/build.js` 中添加显示名称：
```javascript
function getCategoryDisplayName(category) {
  const displayNames = {
    'new-category': '新分类名称',
    // ...
  };
  return displayNames[category] || category;
}
```

### 修改样式

编辑 `src/build.js` 中的 `generateIndex` 函数，修改 CSS 样式。

### 自定义域名

在 `wrangler.toml` 中配置域名，然后在 Cloudflare 后台绑定：
```
fin.a11.world → Cloudflare Pages
```

## 🛠 技术栈

- **静态网站生成**：自定义 Node.js 脚本
- **部署平台**：Cloudflare Pages
- **CLI 工具**：Wrangler
- **版本控制**：Git

## 📝 注意事项

1. **文章日期**：优先使用 `<meta name="date">`，其次从文件名提取
2. **文章排序**：首页按日期倒序排列
3. **分类筛选**：点击分类卡片可筛选文章
4. **构建缓存**：每次提交会重新构建，无需手动清理
5. **CDN 缓存**：部署后可能等待几分钟生效

## 🔐 环境变量

如需配置环境变量，创建 `.env` 文件：
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

## 📞 支持

如有问题，请检查：
1. 文章 HTML 格式是否正确
2. 文件名是否包含日期前缀
3. 构建日志是否有错误
4. Wrangler 配置是否正确

---

**Owner**: Mason  
**更新日期**: 2024-04-26
