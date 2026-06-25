# publish-article Skill

自动化发布 HTML 文章到 fin-reports 项目的 Skill。

## 功能

1. **解析 HTML**：自动提取文章标题、日期和分类
2. **文件命名**：根据日期和标题生成规范的文件名
3. **复制文件**：将文章复制到目标分类目录
4. **自动构建**：触发项目的构建脚本
5. **一键部署**：发布到 Cloudflare Pages

## 安装

```bash
cd skills/publish-article
npm install
npm run build
```

## 使用

### 基本用法

```bash
# 发布文章（自动检测分类）
publish-article ~/Downloads/article.html

# 指定分类
publish-article ~/Downloads/article.html --category market-analysis

# 指定日期
publish-article ~/Downloads/article.html --date 2026-06-25

# 跳过部署
publish-article ~/Downloads/article.html --skip-deploy

# 预览模式
publish-article ~/Downloads/article.html --dry-run
```

### 代码调用

```typescript
import { publishArticle } from './src/index.js';

const result = await publishArticle({
  sourcePath: '~/Downloads/article.html',
  category: 'market-analysis',
  date: '2026-06-25',
  skipDeploy: false,
});

if (result.success) {
  console.log('发布成功！', result.article.url);
}
```

## 文件命名规则

```
YYYY-MM-DD-{sanitized-title}.html
```

- 标题会被清理：保留中文、英文、数字，特殊字符替换为连字符
- 示例：`2026-06-25-ai-hot-日报.html`

## 分类支持

- `market-analysis` - 市场分析
- `industry-research` - 行业研究
- `company-reports` - 公司报告
- `AI-daily` - AI 日报

## 开发

```bash
# 开发模式（监听文件变化）
npm run dev

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

## 架构

```
src/
├── types.ts          # 类型定义
├── parser.ts         # HTML 解析
├── namer.ts          # 文件命名
├── validator.ts      # 输入验证
├── copier.ts         # 文件复制
├── error-handler.ts  # 错误处理
├── integrator.ts     # 构建系统集成
├── index.ts          # 主流程
└── cli.ts            # CLI 接口
```
