# 部署验证清单

## ✅ 构建验证

```bash
✅ 构建成功: npm run build
✅ 文件数量: 5 个 HTML 文件
✅ 文件大小: 24KB
✅ 目录结构: 正确
✅ 本地预览: HTTP 200 OK
```

## 📋 部署前检查

### 1. Cloudflare 账户状态
```bash
wrangler whoami
# ✅ 已登录: dduyoung@gmail.com
```

### 2. 域名准备
- 主域名：fin.a11.world
- 需要在 Cloudflare DNS 中添加 CNAME 记录
- 或者在 Cloudflare Pages 项目设置中绑定自定义域名

### 3. 构建输出验证
```bash
npm run build
ls -lh public/
# 确认 public/index.html 存在
```

## 🚀 部署步骤

### 方案 A：使用 Wrangler CLI（推荐）

```bash
# 1. 创建新项目（首次部署）
wrangler pages project create fin-reports --production-branch=main

# 2. 部署
wrangler pages deploy public

# 3. 绑定自定义域名（在 Cloudflare 后台操作）
# 或使用命令行：
wrangler pages deploy public --project-name=fin-reports
```

### 方案 B：使用 npm 脚本

```bash
npm run deploy
```

### 方案 C：连接 Git 仓库（自动化部署）

1. 在 Cloudflare Pages 中创建项目
2. 连接 GitHub/GitLab 仓库
3. 配置构建命令：`npm run build`
4. 配置输出目录：`public`
5. 每次推送到 main 分支自动部署

## 🔧 域名配置

### 在 Cloudflare 后台配置 DNS

```
类型: CNAME
名称: fin
目标: [你的 Pages 项目域名]
代理状态: 已代理（橙色云朵）
```

### 或在 Pages 项目设置中绑定

1. 进入项目 → Custom domains
2. Add domain → fin.a11.world
3. 按照提示配置 DNS 记录

## ✨ 部署后验证

```bash
# 1. 检查部署状态
wrangler pages deployment list --project-name=fin-reports

# 2. 访问网站
curl -I https://fin.a11.world

# 3. 检查 DNS 传播
dig fin.a11.world
```

## 📝 日常使用流程

### 添加新文章

```bash
# 1. 创建文章
cp articles/article-template.html articles/market-analysis/2024-04-26-new-article.html
vim articles/market-analysis/2024-04-26-new-article.html

# 2. 提交（自动触发构建）
git add articles/
git commit -m "feat: 添加新文章"

# 3. 部署
npm run deploy
# 或
wrangler pages deploy public --project-name=fin-reports
```

### 更新现有文章

```bash
# 1. 编辑文章
vim articles/market-analysis/existing-article.html

# 2. 提交并部署
git add articles/
git commit -m "update: 更新文章内容"
npm run deploy
```

## ⚠️ 常见问题

### 问题 1：部署失败
```bash
# 检查构建输出
npm run build

# 检查 Wrangler 配置
cat wrangler.toml

# 检查登录状态
wrangler whoami
```

### 问题 2：域名无法访问
```bash
# 检查 DNS 配置
dig fin.a11.world

# 检查 Cloudflare Pages 项目设置
wrangler pages project list
```

### 问题 3：首页没有更新
```bash
# 清除浏览器缓存
# 或使用隐私模式访问

# 检查最新部署
wrangler pages deployment list --project-name=fin-reports
```

## 🎯 快速命令参考

```bash
# 构建
npm run build

# 本地预览
npm run dev

# 部署
npm run deploy
wrangler pages deploy public

# 查看项目列表
wrangler pages project list

# 查看部署历史
wrangler pages deployment list --project-name=fin-reports

# 登录/登出
wrangler login
wrangler logout
```

---

**Owner**: Mason
**最后更新**: 2024-04-26
