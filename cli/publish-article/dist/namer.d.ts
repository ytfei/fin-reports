/**
 * File Namer - Generate safe filenames from article titles
 */
/**
 * Sanitize title to create safe filename
 * Rules:
 * - Keep Chinese characters, English letters, numbers, hyphens, underscores
 * - Replace spaces with hyphens
 * - Remove special characters
 * - Trim leading/trailing hyphens
 * - Limit length (with room for date prefix)
 */
export declare function sanitizeFilename(title: string): string;
/**
 * Generate full filename with date prefix
 * Format: YYYY-MM-DD-{sanitized-title}.html
 */
export declare function generateFilename(date: string, title: string): string;
/**
 * Generate article URL from category and filename
 */
export declare function generateArticleUrl(category: string, filename: string): string;
//# sourceMappingURL=namer.d.ts.map