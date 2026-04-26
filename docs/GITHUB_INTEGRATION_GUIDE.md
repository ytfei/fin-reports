# GitHub 集成设置指南

## 为什么需要 GitHub 集成？

`wrangler pages deploy` **总是创建 Preview 部署**。

要实现 Production 自动部署，必须使用 **GitHub 集成**。

## 设置步骤

### 1. 在 Cloudflare Dashboard 中连接 GitHub

访问：
```
https://dash.cloudflare.com/2a09af629f41aa6f8025be6d3caa2ce2/pages/view/fin-reports
```

点击 **"Connect to Git"** 按钮：

1. 选择 GitHub
2. 授权 Cloudflare 访问你的 GitHub
3. 选择仓库：`mason/fin-reports`（或你的实际仓库）
4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `public`
   - **Root directory**: `/`（根目录）
   - **Branch**: `main`

5. **Production branch** 设置为 `main`

6. 点击 **"Save and Deploy"**

### 2. 推送代码到 GitHub

```bash
# 如果还没有推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/fin-reports.git
git push -u origin main
```

### 3. 自动部署

现在每次推送代码到 GitHub：
- `main` 分支 → **Production** ✅
- 其他分支 → **Preview**

### 4. 日常使用流程

```bash
# 1. 添加新文章
cp articles/article-template.html articles/market-analysis/2024-04-26-new.html
vim articles/market-analysis/2024-04-26-new.html

# 2. 提交
git add articles/
git commit -m "feat: 添加新文章"

# 3. 推送到 GitHub（自动触发 Production 部署）
git push origin main

# 完成！访问 https://fin.a11.world 查看更新
```

## 不再使用 wrangler 手动部署

连接 GitHub 后，**不需要再运行 `npm run deploy`**。

只需 `git push`，Cloudflare 会自动：
1. 检测到 main 分支的推送
2. 运行 `npm run build`
3. 部署到 Production 环境
4. 更新 https://fin.a11.world

## 验证 Production 部署

推送代码后，访问：
```
https://dash.cloudflare.com/2a09af629f41aa6f8025be6d3caa2ce2/pages/view/fin-reports
```

查看 "Deployments" 标签页，应该看到：
- **Production**: main 分支的最新部署
- **Preview**: 历史部署（滚动更新）

## 总结

```
之前（手动部署）：
npm run deploy → 总是 Preview ❌

现在（GitHub 集成）：
git push → 自动 Production ✅
```

这就是为什么隔壁组的 agent 一次就过了 — 他们可能直接用了 GitHub 集成！
