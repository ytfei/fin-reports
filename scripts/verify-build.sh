#!/bin/bash

# 快速部署验证脚本

echo "🔍 部署前快速验证"
echo "===================="
echo ""

# 1. 检查构建
echo "1️⃣ 检查构建..."
if [ -d "public" ] && [ -f "public/index.html" ]; then
  echo "✅ 构建输出正常"
  HTML_COUNT=$(find public -name "*.html" | wc -l | tr -d ' ')
  echo "   📄 HTML 文件: $HTML_COUNT 个"
else
  echo "❌ 构建输出缺失"
  echo "   请先运行: npm run build"
  exit 1
fi

# 2. 检查配置
echo ""
echo "2️⃣ 检查配置..."
if [ -f "wrangler.toml" ]; then
  echo "✅ wrangler.toml 存在"
else
  echo "❌ wrangler.toml 缺失"
  exit 1
fi

# 3. 检查登录
echo ""
echo "3️⃣ 检查 Cloudflare 登录..."
if wrangler whoami >/dev/null 2>&1; then
  echo "✅ 已登录 Cloudflare"
else
  echo "❌ 未登录 Cloudflare"
  echo "   请先运行: npx wrangler login"
  exit 1
fi

# 4. 显示部署信息
echo ""
echo "📋 部署信息"
echo "===================="
echo "项目名称: fin-reports"
echo "构建目录: public/"
echo "目标域名: fin.a11.world"
echo ""

# 5. 下一步
echo "🚀 准备就绪！"
echo ""
echo "部署命令（任选其一）："
echo "  1. npm run deploy"
echo "  2. wrangler pages deploy public --project-name=fin-reports"
echo ""
echo "首次部署需要创建项目："
echo "  wrangler pages project create fin-reports"
echo ""
