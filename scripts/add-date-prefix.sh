#!/bin/bash

# 为没有日期前缀的 HTML 文件添加日期前缀
# 从文件创建日期中提取日期

set -e

ARTICLES_DIR="/Users/mason/codebase/NexTech/fin-reports/articles"

echo "🔍 扫描 articles 目录并添加日期前缀..."
echo ""

# 使用临时文件统计
TMP_STATS=$(mktemp)
echo "0" > "$TMP_STATS"  # 总数
echo "0" >> "$TMP_STATS"  # 已重命名
echo "0" >> "$TMP_STATS"  # 已跳过

# 查找所有 HTML 文件
find "$ARTICLES_DIR" -name "*.html" -type f | while read -r file; do
  # 读取计数
  TOTAL=$(sed -n '1p' "$TMP_STATS")
  RENAMED=$(sed -n '2p' "$TMP_STATS")
  SKIPPED=$(sed -n '3p' "$TMP_STATS")

  TOTAL=$((TOTAL + 1))

  filename=$(basename "$file")
  dirname=$(dirname "$file")

  # 检查是否已有日期前缀 (YYYY-MM-DD 格式)
  if [[ $filename =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2} ]]; then
    echo "⏭️  跳过（已有日期）: $filename"
    SKIPPED=$((SKIPPED + 1))
  else
    # 获取文件创建日期（macOS 使用 stat -f %SB）
    # 使用 birth time (创建时间)
    created_date=$(stat -f "%SB" -t "%Y-%m-%d" "$file" 2>/dev/null)

    # 如果无法获取创建日期，使用修改时间
    if [ -z "$created_date" ] || [ "$created_date" == "2024-01-01" ] || [ "$created_date" == "1970-01-01" ]; then
      created_date=$(stat -f "%Sm" -t "%Y-%m-%d" "$file")
    fi

    # 构造新文件名
    new_filename="${created_date}-${filename}"
    new_path="${dirname}/${new_filename}"

    # 检查新文件名是否已存在
    if [ -f "$new_path" ]; then
      echo "⚠️  跳过（目标已存在）: $new_filename"
      SKIPPED=$((SKIPPED + 1))
    else
      # 重命名文件
      mv "$file" "$new_path"
      echo "✅ 重命名: $filename → $new_filename"
      RENAMED=$((RENAMED + 1))
    fi
  fi

  # 更新计数
  echo "$TOTAL" > "$TMP_STATS"
  echo "$RENAMED" >> "$TMP_STATS"
  echo "$SKIPPED" >> "$TMP_STATS"
done

# 读取最终统计
TOTAL=$(sed -n '1p' "$TMP_STATS")
RENAMED=$(sed -n '2p' "$TMP_STATS")
SKIPPED=$(sed -n '3p' "$TMP_STATS")

# 清理临时文件
rm -f "$TMP_STATS"

echo ""
echo "📊 统计："
echo "   总文件数: $TOTAL"
echo "   已重命名: $RENAMED"
echo "   已跳过: $SKIPPED"
echo ""
echo "✨ 完成！"
