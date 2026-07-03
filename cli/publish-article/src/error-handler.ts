/**
 * Error Handler - Centralized error handling with rollback support
 */

import type { PublishError, PublishContext } from './types.js';

/**
 * Create a publish error object
 */
export function createPublishError(
  step: PublishError['step'],
  code: string,
  message: string,
  details?: unknown
): PublishError {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    step,
  };
}

/**
 * Handle error — reports error but does NOT delete published files.
 * The copied article file in fin-reports/articles/ is preserved.
 */
export function handleError(
  error: unknown,
  step: PublishError['step'],
  context: PublishContext
): PublishError {
  // Extract error message
  const errorMessage = error instanceof Error ? error.message : String(error);

  return {
    success: false,
    error: {
      code: getErrorCode(step),
      message: errorMessage,
      details: error instanceof Error ? error.stack : undefined,
    },
    step,
    rollback: {
      performed: false,
      details: `文件保留 — ${context.targetPath || '目标路径未记录'}`,
    },
  };
}

/**
 * Get error code based on step
 */
function getErrorCode(step: PublishError['step']): string {
  const codes: Record<PublishError['step'], string> = {
    validation: 'VALIDATION_ERROR',
    parsing: 'PARSE_ERROR',
    copy: 'COPY_ERROR',
    build: 'BUILD_ERROR',
    deploy: 'DEPLOY_ERROR',
  };
  return codes[step];
}

/**
 * Format error for user display
 */
export function formatError(error: PublishError): string {
  const lines = [
    '❌ 发布失败',
    '',
    `阶段: ${error.step}`,
    `错误代码: ${error.error.code}`,
    `消息: ${error.error.message}`,
  ];

  if (error.rollback) {
    lines.push('');
    lines.push('回滚状态:');
    lines.push(`  已执行: ${error.rollback.performed ? '是' : '否'}`);
    lines.push(`  详情: ${error.rollback.details}`);
  }

  return lines.join('\n');
}
