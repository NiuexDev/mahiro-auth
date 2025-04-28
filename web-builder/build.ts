import { build } from "esbuild"
import { execSync } from "node:child_process"
import { log } from "node:console"
import { access, constants, mkdir } from "node:fs/promises"

try {
    await access("dist", constants.F_OK)
} catch (e) {
    await mkdir("dist")
}

// ESM 构建配置
await build({
    entryPoints: ["run.ts"],
    bundle: true,
    packages: "bundle", // 自动处理依赖
    platform: "node",
    target: "esnext",
    keepNames: true,
    format: "esm",
    outfile: "dist/web-builder.js",
    define: {
        "import.meta.env.commitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH.slice(0, 7)) : JSON.stringify(null),
        "import.meta.env.longCommitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify(null),
        "import.meta.env.develop": JSON.stringify(null)
    }
})