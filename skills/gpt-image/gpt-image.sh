#!/usr/bin/env bash
#
# gpt-image.sh - GPT-4O 图像生成脚本
# 用法: ./gpt-image.sh "prompt" [size] [n] [model]
#

set -euo pipefail

# 配置
API_BASE="${API_BASE:-https://api.apimart.ai}"
API_KEY="${APIMART_API_KEY:-}"
POLL_INTERVAL=3          # 轮询间隔（秒）
MAX_WAIT_TIME=60          # 最大等待时间（秒）

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warn()    { echo -e "${YELLOW}⚠${NC} $1"; }
log_error()   { echo -e "${RED}✗${NC} $1"; }

# 检查 API Key
check_api_key() {
  if [[ -z "$API_KEY" ]]; then
    log_error "未设置 APIMART_API_KEY 环境变量"
    echo ""
    echo "获取 API Key: https://apimart.ai/keys"
    echo "设置方法:"
    echo "  export APIMART_API_KEY=\"your-api-key-here\""
    echo ""
    echo "或在 ~/.zshrc 中永久添加:"
    echo "  echo 'export APIMART_API_KEY=\"your-api-key-here\"' >> ~/.zshrc"
    exit 1
  fi
}

# 提交图像生成任务
submit_task() {
  local prompt="$1"
  local size="${2:-1:1}"
  local n="${3:-1}"
  local model="${4:-gpt-4o-image}"

  log_info "正在提交图像生成任务..."
  echo "  📝 描述: $prompt"
  echo "  📐 尺寸: $size"
  echo "  🔢 数量: $n"
  echo "  🤖 模型: $model"
  echo ""

  local response
  response=$(curl --silent --request POST \
    --url "$API_BASE/v1/images/generations" \
    --header "Authorization: Bearer $API_KEY" \
    --header 'Content-Type: application/json' \
    --data "{\"prompt\":\"$prompt\",\"model\":\"$model\",\"size\":\"$size\",\"n\":$n}" 2>&1)

  # 检查 curl 错误
  if [[ $? -ne 0 ]]; then
    log_error "网络请求失败"
    echo "$response"
    exit 1
  fi

  # 解析响应
  local code
  code=$(echo "$response" | jq -r '.code // .error.code // empty' 2>/dev/null)

  if [[ "$code" == "200" ]]; then
    local task_id
    task_id=$(echo "$response" | jq -r '.data[0].task_id' 2>/dev/null)
    log_success "任务提交成功!"
    echo "  📋 任务 ID: $task_id"
    echo ""
    echo "$task_id"
  else
    log_error "任务提交失败"
    echo ""
    echo "响应:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    exit 1
  fi
}

# 查询任务结果
query_task() {
  local task_id="$1"

  local response
  response=$(curl --silent --request GET \
    --url "$API_BASE/v1/tasks/$task_id" \
    --header "Authorization: Bearer $API_KEY" 2>&1)

  echo "$response"
}

# 轮询等待任务完成
poll_result() {
  local task_id="$1"
  local elapsed=0

  log_info "等待任务完成..."

  while [[ $elapsed -lt $MAX_WAIT_TIME ]]; do
    local response
    response=$(query_task "$task_id")

    # 解析状态
    local status
    status=$(echo "$response" | jq -r '.data.status // empty' 2>/dev/null)

    local status
  status=$(echo "$response" | jq -r '.data.status // empty' 2>/dev/null)

  case "$status" in
    "completed"|"succeeded"|"success")
      echo ""
      log_success "图片生成完成!"
      echo ""
      echo "$response"
      return 0
      ;;
    "failed"|"error")
      echo ""
      log_error "图片生成失败"

      local error_msg
      error_msg=$(echo "$response" | jq -r '.data.error.message // .error.message // empty' 2>/dev/null)
      if [[ -n "$error_msg" ]]; then
        echo "  错误: $error_msg"
      fi
      echo ""
      return 1
      ;;
    "processing"|"pending"|"submitted"|"running"|"")
      # 继续等待
      ;;
    *)
      # 未知状态，显示响应
      log_warn "未知状态: $status"
      echo "$response" | jq '.' 2>/dev/null || echo "$response"
      ;;
  esac

    # 显示进度
    local progress=$((elapsed * 100 / MAX_WAIT_TIME))
    printf "\r  ⏳ 等待中... %ds / %ds (%d%%)" "$elapsed" "$MAX_WAIT_TIME" "$progress"

    sleep "$POLL_INTERVAL"
    elapsed=$((elapsed + POLL_INTERVAL))
  done

  # 超时
  echo ""
  echo ""
  log_warn "等待超时 ($MAX_WAIT_TIME 秒)"
  echo ""
  echo "任务尚未完成，您可以稍后手动查询:"
  echo "  Task ID: $task_id"
  echo ""
  echo "查询命令:"
  echo "  curl -H \"Authorization: Bearer \$APIMART_API_KEY\" \\"
  echo "    \"$API_BASE/v1/images/tasks/$task_id\""
  return 2
}

# 提取并显示图片 URL
display_images() {
  local response="$1"

  local urls
  urls=$(echo "$response" | jq -r '.data.result // .data.images // .data.image_urls // empty' 2>/dev/null)

  if [[ -n "$urls" ]] && [[ "$urls" != "null" ]]; then
    echo ""
    echo "🖼️  生成的图片:"
    echo ""

    # 如果是数组，逐行显示
    if echo "$urls" | jq -e 'type == "array"' >/dev/null 2>&1; then
      echo "$urls" | jq -r '.[]' | nl -w2 -s'. '
    else
      echo "$urls"
    fi

    echo ""
    log_info "图片链接有效期 24 小时，请及时保存"
  else
    echo ""
    log_warn "未能提取图片 URL，原始响应:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  fi
}

# 主函数
main() {
  check_api_key

  # 解析参数
  local prompt="${1:-}"
  local size="${2:-1:1}"
  local n="${3:-1}"
  local model="${4:-gpt-4o-image}"

  if [[ -z "$prompt" ]]; then
    log_error "请提供图片描述"
    echo ""
    echo "用法: $0 \"prompt\" [size] [n] [model]"
    echo ""
    echo "示例:"
    echo "  $0 \"星空下的古老城堡\""
    echo "  $0 \"赛博朋克城市\" 2:3 2"
    echo "  $0 \"可爱的橘猫\" 1:1 1 gpt-4o-image"
    exit 1
  fi

  # 提交任务
  local task_id
  task_id=$(submit_task "$prompt" "$size" "$n" "$model")

  # 轮询等待结果
  local response
  response=$(poll_result "$task_id")
  local poll_status=$?

  if [[ $poll_status -eq 0 ]]; then
    # 成功，显示图片
    display_images "$response"
  elif [[ $poll_status -eq 2 ]]; then
    # 超时，已显示提示信息
    :
  else
    # 失败
    exit 1
  fi
}

# 执行
main "$@"
