const fs = require('fs');
const path = require('path');

/**
 * 文章元数据提取器
 * 抓手：从 HTML 文件中提取标题、日期、描述等元数据
 */
function extractMetadata(filePath, category) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // 提取标题
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.html');

  // 提取日期（从文件名或 meta 标签）
  const dateMatch = content.match(/<meta\s+name="date"\s+content="([^"]+)"/i);
  const dateFromMeta = dateMatch ? dateMatch[1] : null;

  // 从文件名提取日期（格式：YYYY-MM-DD-title.html）
  const filenameDateMatch = path.basename(filePath).match(/^(\d{4}-\d{2}-\d{2})/);
  const date = dateFromMeta || (filenameDateMatch ? filenameDateMatch[1] : '2024-01-01');

  // 提取描述
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const description = descMatch ? descMatch[1] : '';

  return {
    title,
    date,
    category,
    description,
    filename: path.basename(filePath),
    path: `articles/${category}/${path.basename(filePath)}`
  };
}

/**
 * 扫描文章目录
 * 底层逻辑：递归扫描所有 HTML 文件，构建元数据索引
 */
function scanArticles() {
  const articles = [];
  const categories = {};

  // 扫描 articles 目录
  const articlesDir = path.join(__dirname, '..', 'articles');
  const categoriesList = fs.readdirSync(articlesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  categoriesList.forEach(category => {
    const categoryPath = path.join(articlesDir, category);
    const files = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.html'));

    // 分类元数据
    categories[category] = {
      name: category,
      count: files.length,
      displayName: getCategoryDisplayName(category)
    };

    // 文章元数据
    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      const metadata = extractMetadata(filePath, category);
      articles.push(metadata);
    });
  });

  return { articles, categories, categoriesList };
}

/**
 * 分类显示名称映射
 */
function getCategoryDisplayName(category) {
  const displayNames = {
    'market-analysis': '市场分析',
    'industry-research': '行业研究',
    'company-reports': '公司报告'
  };
  return displayNames[category] || category;
}

/**
 * 生成分类页面 HTML
 * 抓手：为每个分类生成独立的列表页面
 */
function generateCategoryPage(category, categoryArticles, categories) {
  const sortedArticles = categoryArticles.sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  // 为分类页面生成相对路径的文章链接
  const categoryArticlesWithRelativePath = sortedArticles.map(article => ({
    ...article,
    relativePath: path.basename(article.path) // 只取文件名，作为相对路径
  }));

  const categoryHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${categories[category].displayName} | 金融研究报告</title>
  <meta name="description" content="${categories[category].displayName} - 专业金融分析报告">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --color-primary: #0a192f;
      --color-secondary: #1a2332;
      --color-accent: #c5a059;
      --color-accent-hover: #d4af37;
      --color-bg: #f8f9fa;
      --color-bg-alt: #ffffff;
      --color-text: #1a1a1a;
      --color-text-secondary: #6c757d;
      --color-border: #dee2e6;
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    body {
      font-family: var(--font-family);
      line-height: 1.6;
      color: var(--color-text);
      background: var(--color-bg);
      font-size: 16px;
    }

    .top-bar {
      background: var(--color-primary);
      color: white;
      padding: 12px 0;
      font-size: 0.875em;
      border-bottom: 3px solid var(--color-accent);
    }

    .top-bar .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    header {
      background: white;
      border-bottom: 1px solid var(--color-border);
      padding: 30px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      flex-direction: column;
    }

    .logo h1 {
      font-size: 2em;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 5px;
      letter-spacing: -0.5px;
    }

    .logo span {
      font-size: 0.875em;
      color: var(--color-accent);
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .page-stats {
      display: flex;
      gap: 30px;
      text-align: right;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .stat-number {
      font-size: 1.75em;
      font-weight: 700;
      color: var(--color-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75em;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .breadcrumb-section {
      background: white;
      border-bottom: 1px solid var(--color-border);
      padding: 15px 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9375em;
    }

    .breadcrumb a {
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }

    .breadcrumb a:hover {
      color: var(--color-accent);
    }

    .breadcrumb .separator {
      color: var(--color-text-secondary);
    }

    .breadcrumb .current {
      color: var(--color-primary);
      font-weight: 500;
    }

    .main-content {
      padding: 50px 0;
    }

    .articles-section {
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .section-header {
      background: var(--color-primary);
      color: white;
      padding: 20px 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 0;
    }

    .section-header .count {
      font-size: 0.9375em;
      opacity: 0.9;
    }

    .article-card {
      padding: 25px;
      border-bottom: 1px solid var(--color-border);
      transition: background 0.2s;
    }

    .article-card:hover {
      background: #fafbff;
    }

    .article-card:last-child {
      border-bottom: none;
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .article-title {
      font-size: 1.25em;
      font-weight: 600;
      margin: 0;
      line-height: 1.4;
    }

    .article-title a {
      color: var(--color-primary);
      text-decoration: none;
      transition: color 0.2s;
    }

    .article-title a:hover {
      color: var(--color-accent);
    }

    .article-date {
      font-size: 0.875em;
      color: var(--color-text-secondary);
      white-space: nowrap;
      padding-left: 20px;
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .article-category {
      display: inline-block;
      background: var(--color-primary);
      color: white;
      padding: 4px 12px;
      font-size: 0.75em;
      font-weight: 500;
      border-radius: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .article-description {
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 0.9375em;
    }

    footer {
      background: var(--color-primary);
      color: white;
      padding: 40px 0 30px;
      margin-top: 60px;
      text-align: center;
      border-top: 3px solid var(--color-accent);
    }

    footer p {
      opacity: 0.9;
      font-size: 0.9375em;
    }

    @media (max-width: 768px) {
      .page-stats {
        display: none;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .article-header {
        flex-direction: column;
      }

      .article-date {
        padding-left: 0;
        margin-top: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="container">
      <span>金融研究报告</span>
      <span>专业金融分析平台</span>
    </div>
  </div>

  <header>
    <div class="container">
      <div class="logo">
        <h1>${categories[category].displayName}</h1>
        <span>Financial Research Reports</span>
      </div>
      <div class="page-stats">
        <div class="stat-item">
          <span class="stat-number">${categoryArticlesWithRelativePath.length}</span>
          <span class="stat-label">报告数量</span>
        </div>
      </div>
    </div>
  </header>

  <div class="breadcrumb-section">
    <div class="container">
      <nav class="breadcrumb">
        <a href="/">首页</a>
        <span class="separator">›</span>
        <span class="current">${categories[category].displayName}</span>
      </nav>
    </div>
  </div>

  <div class="container main-content">
    <section class="articles-section">
      <div class="section-header">
        <h2>${categories[category].displayName}报告</h2>
        <span class="count">共 ${categoryArticlesWithRelativePath.length} 篇</span>
      </div>
      ${categoryArticlesWithRelativePath.map(article => `
      <article class="article-card">
        <div class="article-header">
          <h3 class="article-title">
            <a href="${article.relativePath}">${article.title}</a>
          </h3>
          <time class="article-date">${article.date}</time>
        </div>
        <div class="article-meta">
          <span class="article-category">${categories[article.category].displayName}</span>
        </div>
        ${article.description ? `<p class="article-description">${article.description}</p>` : ''}
      </article>
      `).join('')}
    </section>
  </div>

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} 金融研究报告 | 专业金融分析平台</p>
    </div>
  </footer>
</body>
</html>`;

  return categoryHtml;
}

/**
 * 生成 sitemap.xml
 * 抓手：为 SEO 生成符合标准的 sitemap
 */
function generateSitemap(articles, categories, categoriesList) {
  const baseUrl = 'https://fin.a11.world';
  const currentDate = new Date().toISOString();

  const urls = [
    // 首页
    `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    // 分类页面
    ...categoriesList.map(category => `
  <url>
    <loc>${baseUrl}/articles/${category}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`),
    // 文章页面
    ...articles.map(article => `
  <url>
    <loc>${baseUrl}/${article.path}</loc>
    <lastmod>${article.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`)
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;
}

/**
 * 分类描述
 */
function getCategoryDescription(category) {
  const descriptions = {
    'market-analysis': '深入解读市场趋势与投资机会',
    'industry-research': '深度分析各行业产业链与发展趋势',
    'company-reports': '深度分析各类上市公司的财务状况与投资价值'
  };
  return descriptions[category] || '';
}

/**
 * 生成首页 HTML
 * 底层逻辑：专业金融风格设计，配色方案采用深蓝+金色
 */
function generateIndex(articles, categories, categoriesList) {
  // 按日期排序（最新的在前）
  const sortedArticles = articles.sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>金融研究报告 | 专业金融分析平台</title>
  <meta name="description" content="汇聚市场分析、行业研究与公司报告的专业金融分析平台">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --color-primary: #0a192f;
      --color-secondary: #1a2332;
      --color-accent: #c5a059;
      --color-accent-hover: #d4af37;
      --color-bg: #f8f9fa;
      --color-bg-alt: #ffffff;
      --color-text: #1a1a1a;
      --color-text-secondary: #6c757d;
      --color-border: #dee2e6;
      --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    body {
      font-family: var(--font-family);
      line-height: 1.6;
      color: var(--color-text);
      background: var(--color-bg);
      font-size: 16px;
    }

    .top-bar {
      background: var(--color-primary);
      color: white;
      padding: 12px 0;
      font-size: 0.875em;
      border-bottom: 3px solid var(--color-accent);
    }

    .top-bar .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    header {
      background: white;
      border-bottom: 1px solid var(--color-border);
      padding: 30px 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      flex-direction: column;
    }

    .logo h1 {
      font-size: 2em;
      font-weight: 700;
      color: var(--color-primary);
      margin-bottom: 5px;
      letter-spacing: -0.5px;
    }

    .logo span {
      font-size: 0.875em;
      color: var(--color-accent);
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .stats {
      display: flex;
      gap: 30px;
      text-align: right;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .stat-number {
      font-size: 1.75em;
      font-weight: 700;
      color: var(--color-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.75em;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .hero-section {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: white;
      padding: 60px 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path fill="%23c5a059" fill-opacity="0.1" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path><path fill="%23c5a059" fill-opacity="0.1" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path><path fill="%23c5a059" fill-opacity="0.1" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path></svg>') no-repeat bottom;
      background-size: cover;
      pointer-events: none;
    }

    .hero-section h2 {
      font-size: 2.25em;
      font-weight: 600;
      margin-bottom: 15px;
      position: relative;
    }

    .hero-section p {
      font-size: 1.125em;
      opacity: 0.95;
      max-width: 700px;
      margin: 0 auto 30px;
      position: relative;
    }

    .main-content {
      padding: 50px 0;
    }

    .sidebar {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 30px;
      margin-top: 40px;
    }

    .category-nav {
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      height: fit-content;
    }

    .category-nav h3 {
      background: var(--color-primary);
      color: white;
      padding: 15px 20px;
      font-size: 1em;
      font-weight: 600;
      margin: 0;
    }

    .category-nav a {
      display: block;
      padding: 15px 20px;
      text-decoration: none;
      color: var(--color-text);
      border-bottom: 1px solid var(--color-border);
      transition: all 0.2s;
      position: relative;
    }

    .category-nav a:last-child {
      border-bottom: none;
    }

    .category-nav a::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--color-accent);
      transform: scaleY(0);
      transition: transform 0.2s;
    }

    .category-nav a:hover {
      background: #f8f9fa;
      padding-left: 25px;
    }

    .category-nav a:hover::before {
      transform: scaleY(1);
    }

    .category-nav .cat-name {
      font-weight: 600;
      color: var(--color-text);
      display: block;
    }

    .category-nav .cat-count {
      font-size: 0.875em;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    .articles-section {
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .articles-section h3 {
      background: white;
      color: var(--color-primary);
      padding: 20px 25px;
      font-size: 1.375em;
      font-weight: 600;
      border-bottom: 2px solid var(--color-accent);
      margin: 0;
    }

    .article-card {
      padding: 25px;
      border-bottom: 1px solid var(--color-border);
      transition: background 0.2s;
    }

    .article-card:hover {
      background: #fafbff;
    }

    .article-card:last-child {
      border-bottom: none;
    }

    .article-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .article-title {
      font-size: 1.25em;
      font-weight: 600;
      margin: 0;
      line-height: 1.4;
    }

    .article-title a {
      color: var(--color-primary);
      text-decoration: none;
      transition: color 0.2s;
    }

    .article-title a:hover {
      color: var(--color-accent);
    }

    .article-date {
      font-size: 0.875em;
      color: var(--color-text-secondary);
      white-space: nowrap;
      padding-left: 20px;
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .article-category {
      display: inline-block;
      background: var(--color-primary);
      color: white;
      padding: 4px 12px;
      font-size: 0.75em;
      font-weight: 500;
      border-radius: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .article-description {
      color: var(--color-text-secondary);
      line-height: 1.6;
      font-size: 0.9375em;
    }

    footer {
      background: var(--color-primary);
      color: white;
      padding: 40px 0 30px;
      margin-top: 60px;
      text-align: center;
      border-top: 3px solid var(--color-accent);
    }

    footer p {
      opacity: 0.9;
      font-size: 0.9375em;
    }

    @media (max-width: 900px) {
      .sidebar {
        grid-template-columns: 1fr;
      }

      .stats {
        display: none;
      }
    }

    @media (max-width: 600px) {
      .hero-section h2 {
        font-size: 1.75em;
      }

      .hero-section p {
        font-size: 1em;
      }

      .article-header {
        flex-direction: column;
      }

      .article-date {
        padding-left: 0;
        margin-top: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <div class="container">
      <span>金融研究报告</span>
      <span>专业金融分析平台</span>
    </div>
  </div>

  <header>
    <div class="container">
      <div class="logo">
        <h1>金融研究报告</h1>
        <span>专业金融分析平台</span>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-number">${articles.length}</span>
          <span class="stat-label">总报告数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${categoriesList.length}</span>
          <span class="stat-label">分类数量</span>
        </div>
      </div>
    </div>
  </header>

  <section class="hero-section">
    <div class="container">
      <h2>专业金融分析报告</h2>
      <p>深度市场分析 · 行业产业链研究 · 上市公司财务分析</p>
    </div>
  </section>

  <div class="container main-content">
    <div class="sidebar">
      <nav class="category-nav">
        <h3>研究报告分类</h3>
        ${categoriesList.map(cat => `
        <a href="articles/${cat}/">
          <span class="cat-name">${categories[cat].displayName}</span>
          <span class="cat-count">${categories[cat].count} 篇报告</span>
        </a>
        `).join('')}
      </nav>

      <section class="articles-section">
        <h3>最新发布</h3>
        ${sortedArticles.map(article => `
        <article class="article-card">
          <div class="article-header">
            <h4 class="article-title">
              <a href="${article.path}">${article.title}</a>
            </h4>
            <time class="article-date">${article.date}</time>
          </div>
          <div class="article-meta">
            <span class="article-category">${categories[article.category].displayName}</span>
          </div>
          ${article.description ? `<p class="article-description">${article.description}</p>` : ''}
        </article>
        `).join('')}
      </section>
    </div>
  </div>

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} 金融研究报告 | 专业金融分析平台</p>
    </div>
  </footer>
  </footer>

</body>
</html>`;

  return indexHtml;
}

/**
 * 构建网站
 * 主入口：扫描文章 → 生成首页 → 生成分类页面 → 复制到 public 目录
 */
function build() {
  console.log('🔨 开始构建网站...\n');

  // 扫描文章
  const { articles, categories, categoriesList } = scanArticles();
  console.log(`✅ 扫描到 ${articles.length} 篇文章`);
  console.log(`   - ${Object.keys(categories).length} 个分类\n`);

  // 生成首页
  const indexHtml = generateIndex(articles, categories, categoriesList);

  // 确保 public 目录存在
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 写入首页
  fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
  console.log('✅ 首页已生成: public/index.html');

  // 复制 articles 目录到 public（先复制文章）
  const publicArticlesDir = path.join(publicDir, 'articles');
  if (fs.existsSync(publicArticlesDir)) {
    fs.rmSync(publicArticlesDir, { recursive: true, force: true });
  }
  fs.cpSync(
    path.join(__dirname, '..', 'articles'),
    publicArticlesDir,
    { recursive: true }
  );
  console.log('✅ 文章已复制到 public/articles');

  // 生成分类页面（在复制文章之后生成，避免被覆盖）
  categoriesList.forEach(category => {
    const categoryArticles = articles.filter(a => a.category === category);
    const categoryHtml = generateCategoryPage(category, categoryArticles, categories);
    const categoryDir = path.join(publicDir, 'articles', category);

    // 写入分类页面
    fs.writeFileSync(path.join(categoryDir, 'index.html'), categoryHtml);
    console.log(`✅ 分类页面已生成: public/articles/${category}/index.html`);
  });

  // 生成 sitemap.xml
  const sitemapXml = generateSitemap(articles, categories, categoriesList);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
  console.log('✅ Sitemap 已生成: public/sitemap.xml');

  console.log('✨ 构建完成！');
  console.log(`\n📊 统计：`);
  console.log(`   - 总文章数: ${articles.length}`);
  Object.entries(categories).forEach(([key, value]) => {
    console.log(`   - ${value.displayName}: ${value.count} 篇`);
  });
}

// 运行构建
build();
