#!/bin/bash

# 发布脚本
# 底层逻辑：构建 → 部署 → 验证完整闭环

set -e  # 遇到错误立即退出

echo "🚀 开始发布流程...\n"

# 1. 构建
echo "📦 步骤 1: 构建网站"
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi
echo "✅ 构建完成\n"

# 2. 部署到 Cloudflare Pages
echo "☁️  步骤 2: 部署到 Cloudflare Pages"
wrangler pages deploy public --project-name=fin-reports
if [ $? -ne 0 ]; then
  echo "❌ 部署失败"
  exit 1
fi
echo "✅ 部署完成\n"

# 3. 提示
echo "✨ 发布成功！"
echo "🌐 访问: https://fin.a11.world"
echo "⏰ CDN 生效可能需要几分钟\n"
