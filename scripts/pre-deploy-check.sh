#!/bin/bash

# 部署前验证脚本
# 底层逻辑：确保所有条件满足后再部署，避免失败

set -e

echo "🔍 部署前验证"
echo "===================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
PASS=0
FAIL=0

# 检查函数
check() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
  else
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
  fi
}

# 1. 检查 Node.js
echo "1. 检查运行环境..."
node --version &>/dev/null
check "Node.js 已安装"

# 2. 检查 Wrangler
echo "2. 检查 Wrangler..."
wrangler --version &>/dev/null
check "Wrangler 已安装"

wrangler whoami >/dev/null 2>&1
check "Wrangler 已登录"

# 3. 检查构建输出
echo "3. 检查构建输出..."
[ -d "public" ]
check "public/ 目录存在"

[ -f "public/index.html" ]
check "public/index.html 存在"

# 4. 统计文件
echo "4. 统计文件..."
HTML_COUNT=$(find public -name "*.html" -type f | wc -l | tr -d ' ')
echo "   HTML 文件数: $HTML_COUNT"

if [ $HTML_COUNT -gt 0 ]; then
  check "至少有 1 个 HTML 文件"
else
  check "HTML 文件数量检查"
fi

# 5. 检查文章目录
echo "5. 检查文章目录..."
[ -d "public/articles" ]
check "public/articles/ 目录存在"

# 6. 检查配置文件
echo "6. 检查配置文件..."
[ -f "wrangler.toml" ]
check "wrangler.toml 存在"

[ -f "package.json" ]
check "package.json 存在"

# 7. 显示项目信息
echo ""
echo "📊 项目信息"
echo "===================="
echo "项目名称: fin-reports"
echo "构建输出: public/"
echo "域名: fin.a11.world"
echo ""

# 8. 总结
echo "📋 验证结果"
echo "===================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✨ 所有检查通过！可以部署。${NC}"
  echo ""
  echo "🚀 部署命令："
  echo "   wrangler pages deploy public --project-name=fin-reports"
  echo "   或"
  echo "   npm run deploy"
  echo ""
  exit 0
else
  echo -e "${RED}⚠️  有 $FAIL 项检查失败，请修复后再部署${NC}"
  exit 1
fi
