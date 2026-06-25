/**
 * File Copier - Handle file copy and backup operations
 */
import type { PublishContext } from './types.js';
/**
 * Copy source file to target destination
 * Creates target directory if needed, handles existing files
 */
export declare function copyArticleFile(sourcePath: string, targetPath: string, context: PublishContext): void;
/**
 * Rollback file operation
 * Restores backup or removes newly created file
 */
export declare function rollbackCopy(context: PublishContext): void;
/**
 * Clean up backup file after successful operation
 */
export declare function cleanupBackup(context: PublishContext): void;
//# sourceMappingURL=copier.d.ts.map