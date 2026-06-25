/**
 * Integrator - Integration with fin-reports build system
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
/**
 * Detect fin-reports project path
 * Searches common locations for project with src/build.js
 */
export function detectProjectPath() {
    const candidates = [
        process.cwd(),
        path.join(process.cwd(), '..'),
        path.join(process.cwd(), '..', 'NexTech', 'fin-reports'),
        path.join(os.homedir(), 'codebase', 'NexTech', 'fin-reports'),
        '/Users/mason/codebase/NexTech/fin-reports',
    ];
    for (const candidate of candidates) {
        const buildJsPath = path.join(candidate, 'src', 'build.js');
        const packageJsonPath = path.join(candidate, 'package.json');
        if (fs.existsSync(buildJsPath) && fs.existsSync(packageJsonPath)) {
            // Verify it's fin-reports project
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                if (packageJson.name === 'fin-reports') {
                    return candidate;
                }
            }
            catch {
                // Not a valid package.json, continue searching
            }
        }
    }
    throw new Error('无法找到 fin-reports 项目路径');
}
/**
 * Run build command
 */
export function buildProject(options = {}) {
    const projectPath = detectProjectPath();
    console.log('🔨 开始构建...');
    try {
        const result = execSync('npm run build', {
            cwd: projectPath,
            stdio: options.verbose ? 'inherit' : 'pipe',
            encoding: 'utf-8',
        });
        if (!options.verbose) {
            console.log(result);
        }
        // Validate build output
        const publicDir = path.join(projectPath, 'public');
        const indexPath = path.join(publicDir, 'index.html');
        if (!fs.existsSync(indexPath)) {
            throw new Error('构建验证失败: index.html 未生成');
        }
        // Parse build output to extract article counts
        const articleCounts = parseBuildCounts(result);
        console.log('✅ 构建成功');
        return {
            success: true,
            outputDir: publicDir,
            ...articleCounts,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`构建失败: ${errorMessage}`);
    }
}
/**
 * Parse build output to extract article counts
 */
function parseBuildCounts(output) {
    const categoryCounts = {};
    // Try to extract counts from build output
    const countMatch = output.match(/扫描到 (\d+) 篇文章/);
    const articleCount = countMatch ? parseInt(countMatch[1], 10) : 0;
    // Extract category counts if available
    const categoryMatches = output.matchAll(/- (.+): (\d+) 篇/g);
    for (const match of categoryMatches) {
        const category = match[1];
        const count = parseInt(match[2], 10);
        categoryCounts[category] = count;
    }
    return { articleCount, categoryCounts };
}
/**
 * Run deploy command
 */
export function deployProject(options = {}) {
    const projectPath = detectProjectPath();
    console.log('🚀 开始部署...');
    try {
        if (options.dryRun) {
            console.log('⚠️  Dry run 模式，跳过实际部署');
            return {
                success: true,
                url: 'https://fin.a11.world',
            };
        }
        const command = options.branch
            ? `wrangler pages deploy public --project-name=fin-reports --branch=${options.branch}`
            : 'npm run deploy';
        const result = execSync(command, {
            cwd: projectPath,
            stdio: 'inherit',
            encoding: 'utf-8',
        });
        // Try to extract deployment ID from result
        let deploymentId;
        const idMatch = result.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (idMatch) {
            deploymentId = idMatch[1];
        }
        console.log('✅ 部署成功');
        console.log('🌐 访问: https://fin.a11.world');
        return {
            success: true,
            url: 'https://fin.a11.world',
            deploymentId,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`部署失败: ${errorMessage}`);
    }
}
/**
 * Confirm deployment with user
 */
export async function confirmDeploy() {
    // For CLI use, this would use inquirer
    // For now, always return true
    return true;
}
//# sourceMappingURL=integrator.js.map