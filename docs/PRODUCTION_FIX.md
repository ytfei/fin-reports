# Production 环境设置指南

## 问题现状

所有部署都在 Preview 环境，只有第一个部署是 Production。

## 根本原因

Cloudflare Pages 需要**明确指定 production branch**，否则所有部署都是 Preview。

## 解决方案

### 方案 1：Dashboard 设置（推荐）⭐

1. **访问项目设置**
   ```
   https://dash.cloudflare.com/2a09af629f41aa6f8025be6d3caa2ce2/pages/view/fin-reports/settings
   ```

2. **设置 Production Branch**
   - 找到 "Production branch" 字段
   - 输入：`main`
   - 保存

3. **重新部署**
   ```bash
   npm run deploy
   ```

   现在 `main` 分支的部署会自动成为 Production。

### 方案 2：删除重建（确保配置正确）

```bash
# 1. 删除现有项目
wrangler pages project delete fin-reports

# 2. 重新创建并指定 production branch
wrangler pages project create fin-reports --production-branch=main

# 3. 重新部署
npm run deploy
```

### 方案 3：使用自定义域名（临时方案）

由于项目已经绑定了 `fin.a11.world`，可以直接使用：

```
https://fin.a11.world
```

这个域名会指向最新的 Production 部署。

## 当前状态

```
✅ 域名已绑定：fin.a11.world
✅ 别名 URL：https://main.fin-reports.pages.dev
⚠️  Production branch：未设置
```

## 推荐操作

**立即执行方案 1**，在 Dashboard 中设置 production branch 为 `main`。

这样以后每次 `npm run deploy` 都会自动部署到 Production 环境。

## 验证 Production 环境

设置完成后，运行：

```bash
wrangler pages deployment list --project-name=fin-reports
```

查看 "Environment" 列，应该看到：
- Production: main 分支的最新部署
- Preview: 其他分支或测试部署
