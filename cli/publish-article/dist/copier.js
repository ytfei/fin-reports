/**
 * File Copier - Handle file copy and backup operations
 */
import * as fs from 'fs';
import * as path from 'path';
/**
 * Copy source file to target destination
 * Creates target directory if needed, handles existing files
 */
export function copyArticleFile(sourcePath, targetPath, context) {
    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    // Check if target file already exists
    if (fs.existsSync(targetPath)) {
        // Create backup
        context.backupPath = targetPath + '.backup';
        fs.copyFileSync(targetPath, context.backupPath);
        console.log(`⚠️  已备份现有文件: ${context.backupPath}`);
    }
    // Copy source file to target
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ 文件已复制到: ${targetPath}`);
}
/**
 * Rollback file operation
 * Restores backup or removes newly created file
 */
export function rollbackCopy(context) {
    // If backup exists, restore it
    if (context.backupPath && fs.existsSync(context.backupPath)) {
        fs.copyFileSync(context.backupPath, context.targetPath);
        fs.unlinkSync(context.backupPath);
        console.log('⚠️  已回滚文件更改（恢复备份）');
    }
    // If no backup but target file exists, remove it (newly created)
    else if (fs.existsSync(context.targetPath)) {
        fs.unlinkSync(context.targetPath);
        console.log('⚠️  已删除新创建的文件');
    }
}
/**
 * Clean up backup file after successful operation
 */
export function cleanupBackup(context) {
    if (context.backupPath && fs.existsSync(context.backupPath)) {
        fs.unlinkSync(context.backupPath);
    }
}
//# sourceMappingURL=copier.js.map