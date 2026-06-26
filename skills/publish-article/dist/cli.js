#!/usr/bin/env node
/**
 * CLI Interface - Command-line interface for publish-article skill
 */
import { Command } from 'commander';
import { publishArticle } from './index.js';
const program = new Command();
program
    .name('publish-article')
    .description('发布 HTML 文章到 fin-reports 项目')
    .version('2.0.0')
    .argument('<sourcePath>', '源 HTML 文件路径')
    .option('-c, --category <category>', '目标分类目录')
    .option('-d, --date <date>', '发布日期 (YYYY-MM-DD)')
    .option('-m, --message <message>', 'Git 提交消息')
    .option('--skip-deploy', '跳过部署，仅构建')
    .option('--dry-run', '预览模式，不执行实际操作')
    .option('-v, --verbose', '详细输出')
    .action(async (sourcePath, options) => {
    try {
        const result = await publishArticle({
            sourcePath,
            category: options.category,
            date: options.date,
            commitMessage: options.message,
            skipDeploy: options.skipDeploy,
            dryRun: options.dryRun,
            verbose: options.verbose,
        });
        if (!result.success) {
            process.exit(1);
        }
    }
    catch (error) {
        console.error('❌ 发生错误:', error);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map