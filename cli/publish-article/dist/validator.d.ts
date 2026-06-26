/**
 * Input Validator - Validate publish article inputs
 */
import type { ValidationError, PublishArticleInput } from './types.js';
/**
 * Validate input parameters for article publishing
 */
export declare function validateInput(input: PublishArticleInput): ValidationError[];
/**
 * Check if validation has any errors (not warnings)
 */
export declare function hasErrors(errors: ValidationError[]): boolean;
/**
 * Format validation errors for display
 */
export declare function formatValidationErrors(errors: ValidationError[]): string;
//# sourceMappingURL=validator.d.ts.map