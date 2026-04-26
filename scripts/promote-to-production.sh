#!/bin/bash

# 将最新的 Preview 部署提升为 Production
# 使用 Cloudflare API

set -e

# 配置
CLOUDFLARE_ACCOUNT_ID="2a09af629f41aa6f8025be6d3caa2ce2"
PROJECT_NAME="fin-reports"

# 获取最新的 Preview 部署 ID
echo "🔍 获取最新的 Preview 部署..."

LATEST_PREVIEW_DEPLOYMENT=$(wrangler pages deployment list \
  --project-name="$PROJECT_NAME" \
  2>&1 | \
  grep -E "^\|" \
  | head -2 \
  | tail -1 \
  | awk '{print $1}')

if [ -z "$LATEST_PREVIEW_DEPLOYMENT" ]; then
  echo "❌ 无法获取最新部署"
  exit 1
fi

echo "✅ 找到最新部署: $LATEST_PREVIEW_DEPLOYMENT"

# 显示部署信息
echo ""
echo "📊 部署信息："
wrangler pages deployment list \
  --project-name="$PROJECT_NAME" \
  2>&1 | \
  grep "$LATEST_PREVIEW_DEPLOYMENT" -A 5

echo ""
echo "⚠️  注意：Cloudflare API 不支持直接将 Preview 提升为 Production"
echo ""
echo "请访问以下链接手动操作："
echo "https://dash.cloudflare.com/$CLOUDFLARE_ACCOUNT_ID/pages/view/$PROJECT_NAME"
echo ""
echo "或者使用 GitHub 集成（推荐）："
echo "查看 docs/GITHUB_INTEGRATION_GUIDE.md"
