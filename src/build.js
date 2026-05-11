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

  const categoryHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${categories[category].displayName} | fin.a11.world</title>
  <meta name="description" content="${categories[category].displayName}汇集">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      margin-bottom: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      font-weight: 700;
    }

    header p {
      font-size: 1.1em;
      opacity: 0.9;
    }

    .breadcrumb {
      margin-bottom: 20px;
    }

    .breadcrumb a {
      color: #667eea;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .articles-section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .articles-section h2 {
      color: #333;
      margin-bottom: 20px;
      font-size: 1.8em;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .article-card {
      padding: 20px;
      border-bottom: 1px solid #eee;
      transition: background 0.2s;
    }

    .article-card:hover {
      background: #f9f9f9;
    }

    .article-card:last-child {
      border-bottom: none;
    }

    .article-title {
      font-size: 1.3em;
      color: #667eea;
      margin-bottom: 10px;
    }

    .article-title a {
      color: inherit;
      text-decoration: none;
    }

    .article-title a:hover {
      text-decoration: underline;
    }

    .article-meta {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 10px;
    }

    .article-category {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      margin-right: 10px;
    }

    .article-description {
      color: #555;
      line-height: 1.5;
    }

    footer {
      text-align: center;
      padding: 30px 20px;
      color: #666;
      font-size: 0.9em;
    }

    @media (max-width: 768px) {
      header h1 {
        font-size: 1.8em;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>${categories[category].displayName}</h1>
      <p>${getCategoryDescription(category)}</p>
    </div>
  </header>

  <div class="container">
    <div class="breadcrumb">
      <a href="/">返回首页</a>
    </div>

    <section class="articles-section">
      <h2>${categories[category].displayName}列表</h2>
      ${sortedArticles.map(article => `
      <div class="article-card">
        <h3 class="article-title">
          <a href="${article.path}">${article.title}</a>
        </h3>
        <div class="article-meta">
          <span class="article-category">${categories[article.category].displayName}</span>
          <span>${article.date}</span>
        </div>
        ${article.description ? `<p class="article-description">${article.description}</p>` : ''}
      </div>
      `).join('')}
    </section>
  </div>

  <footer>
    <p>&copy; ${new Date().getFullYear()} fin.a11.world - 金融分析文章汇集</p>
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
 * 闭环：自动生成首页，展示所有文章
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
  <title>金融分析文章汇集 | fin.a11.world</title>
  <meta name="description" content="汇集各类金融分析报告，包括市场分析、行业研究和公司报告">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      margin-bottom: 40px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      font-weight: 700;
    }

    header p {
      font-size: 1.1em;
      opacity: 0.9;
    }

    .categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .categories a {
      text-decoration: none;
      color: inherit;
    }

    .category-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }

    .categories a:hover .category-card {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .category-card h3 {
      color: #667eea;
      margin-bottom: 10px;
      font-size: 1.2em;
    }

    .category-card .count {
      color: #666;
      font-size: 0.9em;
    }

    .articles-section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .articles-section h2 {
      color: #333;
      margin-bottom: 20px;
      font-size: 1.8em;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .article-card {
      padding: 20px;
      border-bottom: 1px solid #eee;
      transition: background 0.2s;
    }

    .article-card:hover {
      background: #f9f9f9;
    }

    .article-card:last-child {
      border-bottom: none;
    }

    .article-title {
      font-size: 1.3em;
      color: #667eea;
      margin-bottom: 10px;
    }

    .article-title a {
      color: inherit;
      text-decoration: none;
    }

    .article-title a:hover {
      text-decoration: underline;
    }

    .article-meta {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 10px;
    }

    .article-category {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      margin-right: 10px;
    }

    .article-description {
      color: #555;
      line-height: 1.5;
    }

    footer {
      text-align: center;
      padding: 30px 20px;
      color: #666;
      font-size: 0.9em;
    }

    @media (max-width: 768px) {
      header h1 {
        font-size: 1.8em;
      }

      .categories {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <h1>金融分析文章汇集</h1>
      <p>汇聚市场分析、行业研究与公司报告</p>
    </div>
  </header>

  <div class="container">
    <!-- 分类导航 -->
    <section class="categories">
      ${categoriesList.map(cat => `
      <a href="articles/${cat}/" style="text-decoration: none; color: inherit;">
        <div class="category-card">
          <h3>${categories[cat].displayName}</h3>
          <p class="count">${categories[cat].count} 篇文章</p>
        </div>
      </a>
      `).join('')}
    </section>

    <!-- 文章列表 -->
    <section class="articles-section">
      <h2>最新文章</h2>
      ${sortedArticles.map(article => `
      <div class="article-card" data-category="${article.category}">
        <h3 class="article-title">
          <a href="${article.path}">${article.title}</a>
        </h3>
        <div class="article-meta">
          <span class="article-category">${categories[article.category].displayName}</span>
          <span>${article.date}</span>
        </div>
        ${article.description ? `<p class="article-description">${article.description}</p>` : ''}
      </div>
      `).join('')}
    </section>
  </div>

  <footer>
    <p>&copy; ${new Date().getFullYear()} fin.a11.world - 金融分析文章汇集</p>
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
