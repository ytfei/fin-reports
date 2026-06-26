/**
 * Integrator - Integration with fin-reports build system
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
/**
 * Detect fin-reports project path
 * Priority:
 * 1. Explicitly provided path parameter
 * 2. Environment variable FIN_REPORTS_PATH
 * 3. Config file ~/.fin-reports/config.json
 * 4. Search common locations for project with src/build.js
 */
export function detectProjectPath(providedPath) {
    // 1. Explicit parameter
    if (providedPath) {
        if (isValidProjectPath(providedPath)) {
            return providedPath;
        }
        throw new Error(`指定的项目路径无效: ${providedPath}`);
    }
    // 2. Environment variable
    const envPath = process.env.FIN_REPORTS_PATH;
    if (envPath && isValidProjectPath(envPath)) {
        return envPath;
    }
    // 3. Config file
    const configPath = path.join(os.homedir(), '.fin-reports', 'config.json');
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (config.projectPath && isValidProjectPath(config.projectPath)) {
                return config.projectPath;
            }
        }
    }
    catch {
        // Config file doesn't exist or invalid, continue
    }
    // 4. Search common locations
    const candidates = [
        process.cwd(),
        path.join(process.cwd(), '..'),
        path.join(process.cwd(), '..', 'NexTech', 'fin-reports'),
        path.join(os.homedir(), 'codebase', 'NexTech', 'fin-reports'),
        path.join(os.homedir(), 'codebase', 'fin-reports'),
        '/Users/mason/codebase/NexTech/fin-reports',
    ];
    for (const candidate of candidates) {
        if (isValidProjectPath(candidate)) {
            return candidate;
        }
    }
    throw new Error('无法找到 fin-reports 项目路径。请通过以下方式之一指定：\n' +
        '  1. 参数: --project-path /path/to/fin-reports\n' +
        '  2. 环境变量: export FIN_REPORTS_PATH=/path/to/fin-reports\n' +
        '  3. 配置文件: ~/.fin-reports/config.json 中设置 projectPath');
}
/**
 * Verify if a path is a valid fin-reports project
 */
function isValidProjectPath(candidatePath) {
    const buildJsPath = path.join(candidatePath, 'src', 'build.js');
    const packageJsonPath = path.join(candidatePath, 'package.json');
    if (!fs.existsSync(buildJsPath) || !fs.existsSync(packageJsonPath)) {
        return false;
    }
    // Verify it's fin-reports project
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return packageJson.name === 'fin-reports';
    }
    catch {
        return false;
    }
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
/**
 * Git add file
 */
export function gitAdd(filePath, projectPath) {
    const relativePath = path.relative(projectPath, filePath);
    execSync(`git add "${relativePath}"`, {
        cwd: projectPath,
        stdio: 'pipe',
        encoding: 'utf-8',
    });
}
/**
 * Git commit with message
 */
export function gitCommit(message, projectPath) {
    const result = execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
        cwd: projectPath,
        stdio: 'pipe',
        encoding: 'utf-8',
    });
    // Extract commit hash from output
    const match = result.match(/\[([a-f0-9]+)\]/);
    return match ? match[1] : 'unknown';
}
/**
 * Git push to remote
 */
export function gitPush(projectPath) {
    execSync('git push', {
        cwd: projectPath,
        stdio: 'pipe',
        encoding: 'utf-8',
    });
}
//# sourceMappingURL=integrator.js.map