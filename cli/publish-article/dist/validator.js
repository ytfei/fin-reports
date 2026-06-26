/**
 * Input Validator - Validate publish article inputs
 */
import * as fs from 'fs';
import { isValidHtml } from './parser.js';
/**
 * Validate input parameters for article publishing
 */
export function validateInput(input) {
    const errors = [];
    // Check if source path is provided
    if (!input.sourcePath) {
        errors.push({
            field: 'sourcePath',
            message: '源文件路径不能为空',
            severity: 'error',
        });
        return errors; // Early return - nothing to validate without source path
    }
    // Expand home directory if present
    const expandedPath = input.sourcePath.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '');
    // Check if source file exists
    if (!fs.existsSync(expandedPath)) {
        errors.push({
            field: 'sourcePath',
            message: `源文件不存在: ${expandedPath}`,
            severity: 'error',
        });
    }
    // Check if it's a file (not a directory)
    if (fs.existsSync(expandedPath) && fs.statSync(expandedPath).isDirectory()) {
        errors.push({
            field: 'sourcePath',
            message: `源路径是目录而非文件: ${expandedPath}`,
            severity: 'error',
        });
    }
    // Check file extension
    if (!expandedPath.toLowerCase().endsWith('.html')) {
        errors.push({
            field: 'sourcePath',
            message: '源文件必须是 HTML 格式 (.html)',
            severity: 'error',
        });
    }
    // Check if file is readable
    try {
        fs.accessSync(expandedPath, fs.constants.R_OK);
    }
    catch {
        errors.push({
            field: 'sourcePath',
            message: '源文件无法读取（权限问题）',
            severity: 'error',
        });
    }
    // Validate HTML content if file exists and is readable
    if (fs.existsSync(expandedPath) && fs.statSync(expandedPath).isFile()) {
        try {
            const content = fs.readFileSync(expandedPath, 'utf-8');
            // Check for empty file
            if (!content.trim()) {
                errors.push({
                    field: 'sourcePath',
                    message: '源文件为空',
                    severity: 'error',
                });
            }
            // Warn if not valid HTML
            if (!isValidHtml(content)) {
                errors.push({
                    field: 'sourcePath',
                    message: '文件可能不是有效的 HTML 文档（缺少 <html> 或 <!doctype> 标签）',
                    severity: 'warning',
                });
            }
        }
        catch (err) {
            errors.push({
                field: 'sourcePath',
                message: `读取文件失败: ${err.message}`,
                severity: 'error',
            });
        }
    }
    // Validate date format if provided
    if (input.date) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(input.date)) {
            errors.push({
                field: 'date',
                message: '日期格式必须为 YYYY-MM-DD',
                severity: 'error',
            });
        }
        else {
            // Check if date is valid
            const date = new Date(input.date);
            if (isNaN(date.getTime())) {
                errors.push({
                    field: 'date',
                    message: '无效的日期值',
                    severity: 'error',
                });
            }
        }
    }
    return errors;
}
/**
 * Check if validation has any errors (not warnings)
 */
export function hasErrors(errors) {
    return errors.some(e => e.severity === 'error');
}
/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors) {
    const lines = ['验证失败：', ''];
    for (const error of errors) {
        const icon = error.severity === 'error' ? '❌' : '⚠️';
        const label = error.severity === 'error' ? '错误' : '警告';
        lines.push(`${icon} [${label}] ${error.field}: ${error.message}`);
    }
    return lines.join('\n');
}
//# sourceMappingURL=validator.js.map