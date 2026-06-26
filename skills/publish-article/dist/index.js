/**
 * Main Entry Point - Orchestrate the article publishing workflow
 */
import * as fs from 'fs';
import * as path from 'path';
import { validateInput, hasErrors, formatValidationErrors } from './validator.js';
import { extractMetadata } from './parser.js';
import { generateFilename, generateArticleUrl } from './namer.js';
import { copyArticleFile, cleanupBackup } from './copier.js';
import { handleError, formatError } from './error-handler.js';
import { detectProjectPath, buildProject, deployProject, confirmDeploy, gitAdd, gitCommit, gitPush } from './integrator.js';
/**
 * Main function to publish an article
 */
export async function publishArticle(input) {
    console.log('📝 文章发布自动化 Skill');
    console.log('═'.repeat(50));
    try {
        // Step 1: Validate input
        console.log(`📂 源文件: ${input.sourcePath}`);
        const errors = validateInput(input);
        if (hasErrors(errors)) {
            console.log('\n' + formatValidationErrors(errors));
            return handleError(new Error(formatValidationErrors(errors)), 'validation', {});
        }
        // Show warnings if any
        const warnings = errors.filter(e => e.severity === 'warning');
        if (warnings.length > 0) {
            console.log('\n⚠️  警告:');
            warnings.forEach(w => console.log(`   - ${w.message}`));
        }
        // Step 2: Read and parse HTML
        console.log('\n🔍 解析中...');
        const expandedPath = input.sourcePath.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '');
        const htmlContent = fs.readFileSync(expandedPath, 'utf-8');
        const metadata = extractMetadata(htmlContent, path.basename(expandedPath));
        console.log(`   ✅ 标题: ${metadata.title}`);
        console.log(`   ✅ 日期: ${metadata.date}`);
        // Determine category
        const category = input.category || metadata.category;
        if (!category) {
            return handleError(new Error('无法检测文章分类，请使用 --category 参数指定'), 'parsing', {});
        }
        console.log(`   ✅ 分类: ${category}`);
        // Step 3: Generate filename
        const date = input.date || metadata.date;
        const filename = generateFilename(date, metadata.title);
        const projectPath = detectProjectPath();
        const targetPath = path.join(projectPath, 'articles', category, filename);
        const url = generateArticleUrl(category, filename);
        console.log('\n📝 文件信息');
        console.log(`   文件名: ${filename}`);
        console.log(`   目标路径: ${targetPath}`);
        console.log(`   访问 URL: ${url}`);
        // Step 4: Copy file
        if (input.dryRun) {
            console.log('\n⚠️  Dry run 模式，跳过文件复制');
        }
        else {
            console.log('\n📄 复制文件...');
            const context = {
                sourcePath: expandedPath,
                targetPath,
                projectPath,
                category,
                filename,
            };
            try {
                copyArticleFile(expandedPath, targetPath, context);
                console.log('✅ 文件已复制');
            }
            catch (error) {
                return handleError(error, 'copy', context);
            }
            // Step 5: Git operations
            let gitResult = {
                committed: false,
                pushed: false,
            };
            if (!input.dryRun) {
                try {
                    console.log('\n🔧 Git 提交中...');
                    // Generate commit message
                    const commitMessage = input.commitMessage ||
                        `add report: ${metadata.title}\n\nDate: ${date}\nCategory: ${category}\nFile: ${filename}`;
                    // Add file
                    gitAdd(targetPath, projectPath);
                    // Commit
                    const commitHash = gitCommit(commitMessage, projectPath);
                    gitResult.committed = true;
                    gitResult.commitHash = commitHash;
                    console.log(`   [${commitHash}] ${commitMessage.split('\n')[0]}`);
                    // Push
                    gitPush(projectPath);
                    gitResult.pushed = true;
                    console.log('✅ Git 推送成功');
                }
                catch (error) {
                    console.error('⚠️  Git 操作失败:', error instanceof Error ? error.message : String(error));
                    console.log('   继续构建和部署...');
                }
            }
            // Step 6: Build
            try {
                const buildResult = buildProject({ verbose: input.verbose });
                // Step 7: Deploy
                if (!input.skipDeploy) {
                    console.log('\n🚀 部署中...');
                    const deployResult = await confirmDeploy();
                    if (deployResult) {
                        const deployOutput = deployProject({ dryRun: input.dryRun });
                        cleanupBackup(context);
                        // Return success result
                        const result = {
                            success: true,
                            article: {
                                title: metadata.title,
                                date,
                                category,
                                filename,
                                path: targetPath,
                                url,
                            },
                            git: gitResult,
                            build: {
                                success: true,
                                outputDir: buildResult.outputDir,
                                articleCount: buildResult.articleCount,
                                categoryCounts: buildResult.categoryCounts,
                            },
                            deploy: {
                                success: true,
                                url: deployOutput.url,
                                deploymentId: deployOutput.deploymentId,
                            },
                            summary: '✅ 文章发布成功！已部署到 https://fin.a11.world',
                        };
                        console.log('\n' + '═'.repeat(50));
                        console.log(`✨ ${result.summary}`);
                        console.log(`\n📊 统计:`);
                        console.log(`   • 总文章数: ${buildResult.articleCount}`);
                        Object.entries(buildResult.categoryCounts).forEach(([cat, count]) => {
                            console.log(`   • ${cat}: ${count} 篇`);
                        });
                        console.log(`\n🌐 访问: ${url}`);
                        return result;
                    }
                }
                // Build only, no deploy
                cleanupBackup(context);
                console.log('\n✅ 构建完成（未部署）');
            }
            catch (error) {
                return handleError(error, 'build', context);
            }
        }
        // Dry run result
        return {
            success: true,
            article: {
                title: metadata.title,
                date,
                category,
                filename,
                path: targetPath,
                url,
            },
            build: { success: true, outputDir: '', articleCount: 0, categoryCounts: {} },
            deploy: { success: true, url: 'https://fin.a11.world' },
            summary: '✅ Dry run 完成，未做任何更改',
        };
    }
    catch (error) {
        console.log('\n' + formatError(handleError(error, 'validation', {})));
        throw error;
    }
}
/**
 * Export for CLI use
 */
export { publishArticle as main } from './index.js';
//# sourceMappingURL=index.js.map