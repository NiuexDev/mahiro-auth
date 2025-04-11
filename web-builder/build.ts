import { build } from "esbuild"

try {
    await access("dist", constants.F_OK)
} catch (e) {
    await mkdir("dist")
}

const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()

// ESM 构建配置
await build({
    entryPoints: ["run.ts"],
    bundle: true,
    packages: "bundle", // 自动处理依赖
    platform: "node",
    target: "esnext",
    keepNames: true,
    format: "esm",
    outfile: "dist/app.js",
})