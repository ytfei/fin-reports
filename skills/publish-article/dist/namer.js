/**
 * File Namer - Generate safe filenames from article titles
 */
/**
 * Convert HTML entities to their character equivalents
 */
function decodeHtmlEntities(text) {
    const entities = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
    };
    return text.replace(/&[a-z]+;/gi, (entity) => entities[entity] || entity);
}
/**
 * Remove diacritical marks from accented characters
 */
function removeDiacritics(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '');
}
/**
 * Sanitize title to create safe filename
 * Rules:
 * - Keep Chinese characters, English letters, numbers, hyphens, underscores
 * - Replace spaces with hyphens
 * - Remove special characters
 * - Trim leading/trailing hyphens
 * - Limit length (with room for date prefix)
 */
export function sanitizeFilename(title) {
    let cleaned = title;
    // Decode HTML entities
    cleaned = decodeHtmlEntities(cleaned);
    // Remove diacritics
    cleaned = removeDiacritics(cleaned);
    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, '');
    // Remove special characters, keep word characters, spaces, hyphens, underscores
    cleaned = cleaned.replace(/[^一-龥a-zA-Z0-9\s-_]/g, '');
    // Replace multiple spaces with single hyphen
    cleaned = cleaned.replace(/\s+/g, '-');
    // Remove leading/trailing hyphens
    cleaned = cleaned.replace(/^-+|-+$/g, '');
    // Limit length (keep it reasonable for filesystems)
    if (cleaned.length > 50) {
        cleaned = cleaned.slice(0, 50).replace(/-+$/, '');
    }
    // Fallback if empty
    if (!cleaned) {
        cleaned = 'article';
    }
    return cleaned.toLowerCase();
}
/**
 * Generate full filename with date prefix
 * Format: YYYY-MM-DD-{sanitized-title}.html
 */
export function generateFilename(date, title) {
    const sanitizedTitle = sanitizeFilename(title);
    const suffix = sanitizedTitle ? `-${sanitizedTitle}` : '';
    return `${date}${suffix}.html`;
}
/**
 * Generate article URL from category and filename
 */
export function generateArticleUrl(category, filename) {
    return `https://fin.a11.world/articles/${category}/${filename}`;
}
//# sourceMappingURL=namer.js.map