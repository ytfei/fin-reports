/**
 * Error Handler - Centralized error handling with rollback support
 */
import type { PublishError, PublishContext } from './types.js';
/**
 * Create a publish error object
 */
export declare function createPublishError(step: PublishError['step'], code: string, message: string, details?: unknown): PublishError;
/**
 * Handle error with automatic rollback
 */
export declare function handleError(error: unknown, step: PublishError['step'], context: PublishContext): PublishError;
/**
 * Format error for user display
 */
export declare function formatError(error: PublishError): string;
//# sourceMappingURL=error-handler.d.ts.map