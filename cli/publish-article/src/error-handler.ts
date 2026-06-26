/**
 * Error Handler - Centralized error handling with rollback support
 */

import type { PublishError, PublishContext } from './types.js';
import { rollbackCopy } from './copier.js';

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
 * Handle error with automatic rollback
 */
export function handleError(
  error: unknown,
  step: PublishError['step'],
  context: PublishContext
): PublishError {
  // Perform rollback
  let rollbackDetails = '无需回滚';
  let rollbackPerformed = false;

  if (step === 'copy' || step === 'build' || step === 'deploy') {
    try {
      rollbackCopy(context);
      rollbackPerformed = true;
      rollbackDetails = '已回滚文件操作';
    } catch (rollbackError) {
      rollbackDetails = `回滚失败: ${(rollbackError as Error).message}`;
    }
  }

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
      performed: rollbackPerformed,
      details: rollbackDetails,
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
