---
name: gpt-image
title: GPT-4O 文生图
description: 使用 Apimart GPT-4O 图像生成 API 创建图片，自动轮询等待结果
version: 1.0.0
triggers:
  - 生成图片
  - 文生图
  - 创建图片
  - gpt image
  - generate image
  - ai 图片
  - 画图
---

# gpt-image

使用 GPT-4O 图像生成 API 将文本描述转换为图片，**自动轮询等待结果完成**。

## API 初始化

首次使用需要配置 API Key：

```bash
# 设置环境变量（推荐）
export APIMART_API_KEY="your-api-key-here"

# 或者在 ~/.zshrc 中永久添加
echo 'export APIMART_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**获取 API Key**: 访问 https://apimart.ai/keys

## 使用脚本

### 基础用法

```bash
# 使用脚本（推荐）
./skills/gpt-image/gpt-image.sh "星空下的古老城堡"

# 指定尺寸和数量
./skills/gpt-image/gpt-image.sh "赛博朋克城市" 2:3 2

# 完整参数
./skills/gpt-image/gpt-image.sh "可爱的橘猫" 1:1 1 gpt-4o-image
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `$1` | 图片描述（必填） | - |
| `$2` | 尺寸比例 | `1:1` |
| `$3` | 生成数量 | `1` |
| `$4` | 模型名称 | `gpt-4o-image` |

### 支持的尺寸

- `1:1` - 正方形
- `2:3` - 竖长方形
- `3:2` - 横长方形

### 支持的数量

- `1` - 生成 1 张
- `2` - 生成 2 张
- `4` - 生成 4 张

## 脚本执行流程

```
┌─────────────────────────────────────────────────────────────┐
│  1. 检查 API Key                                              │
├─────────────────────────────────────────────────────────────┤
│  2. 提交图像生成任务 → 获取 task_id                           │
├─────────────────────────────────────────────────────────────┤
│  3. 轮询检查任务状态 (每 3 秒)                                 │
│     ├─ completed → 显示图片 URL                              │
│     ├─ failed    → 提示生成失败                               │
│     ├─ processing → 继续等待                                 │
│     └─ 超过 60 秒 → 显示 task_id 提示稍后查询                 │
└─────────────────────────────────────────────────────────────┘
```

## 轮询策略

| 条件 | 行为 |
|------|------|
| 状态 = `completed`/`succeeded` | ✓ 显示图片 URL |
| 状态 = `failed`/`error` | ✗ 提示生成失败 |
| 等待 > 60 秒 | ⚠ 显示 task_id，提示手动查询 |
| 轮询间隔 | 3 秒 |

## Agent 执行指南

当用户请求生成图片时，按以下步骤操作：

### 1. 检查 API Key

```bash
if [ -z "$APIMART_API_KEY" ]; then
  echo "❌ 请先设置 APIMART_API_KEY 环境变量"
  echo "获取 API Key: https://apimart.ai/keys"
  exit 1
fi
```

### 2. 解析用户输入

从自然语言中提取：
- **prompt**: 图片描述（必填）
- **size**: 尺寸比例（默认 1:1）
- **n**: 数量（默认 1）
- **model**: 模型名称（默认 gpt-4o-image）

### 3. 执行脚本

```bash
./skills/gpt-image/gpt-image.sh "$prompt" "$size" "$n" "$model"
```

### 4. 处理结果

| 结果 | Agent 响应 |
|------|-----------|
| 成功 | 显示图片 URL 列表 |
| 超时 | 显示 task_id，说明稍后可查询 |
| 失败 | 显示错误信息 |

## 示例对话

### 成功场景

**用户**: 生成一张星空下的古老城堡图片

**Agent**:
```
ℹ 正在提交图像生成任务...
  📝 描述: 星空下的古老城堡
  📐 尺寸: 1:1
  🔢 数量: 1
  🤖 模型: gpt-4o-image

✓ 任务提交成功!
  📋 任务 ID: task_01K8SGYNNNVBQTXNR4MM964S7K

ℹ 等待任务完成...
  ⏳ 等待中... 15s / 60s (25%)

✓ 图片生成完成!

🖼️  生成的图片:
 1. https://cdn.apimart.ai/xxx/image.png

ℹ 图片链接有效期 24 小时，请及时保存
```

### 超时场景

**Agent**:
```
⚠ 等待超时 (60 秒)

任务尚未完成，您可以稍后手动查询:
  Task ID: task_01K8SGYNNNVBQTXNR4MM964S7K

查询命令:
  curl -H "Authorization: Bearer $APIMART_API_KEY" \
    "https://api.apimart.ai/v1/images/tasks/task_01K8SGYNNNVBQTXNR4MM964S7K"
```

### 失败场景

**Agent**:
```
✗ 图片生成失败

{"error": {"code": 402, "message": "账户余额不足"}}
```

## 手动查询任务

如果脚本超时或需要查询历史任务：

```bash
# 查询任务状态
curl --request GET \
  --url "https://api.apimart.ai/v1/images/tasks/{task_id}" \
  --header "Authorization: Bearer $APIMART_API_KEY"
```

## 图生图（高级功能）

如需使用图生图功能，直接调用 API：

```bash
curl --request POST \
  --url https://api.apimart.ai/v1/images/generations \
  --header "Authorization: Bearer $APIMART_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "prompt": "将这只猫变成卡通风格",
    "model": "gpt-4o-image",
    "image_urls": ["https://example.com/cat.jpg"]
  }'
```

## 注意事项

1. **图片有效期**: 生成的图片链接有效期为 **24 小时**
2. **费用**: API 按生成数量预扣费
3. **限制**: prompt 最长 1000 字符
4. **依赖**: 脚本依赖 `jq` 解析 JSON，`brew install jq`
