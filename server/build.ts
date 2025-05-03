// @ts-nocheck
import { build } from "esbuild"
import { name, version } from "./package.json" assert { type: "json" }
import { mkdir, access, constants, rmdir } from "node:fs/promises"
import { log } from "node:console"
import { execSync } from "node:child_process"

try {
    await access("dist", constants.F_OK)
} catch (e) {
    await mkdir("dist")
}

const bundlefileName = `${name}-v${version}-bun-bundle.js`

// ESM 构建配置
log("ESM build start")
const meatinfo = await build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    packages: "bundle", // 自动处理依赖
    platform: "node",
    target: "esnext",
    keepNames: true,
    minifySyntax: true,
    loader: {
      ".html": "text"
    },
    format: "esm",
    outfile: `dist/${bundlefileName}`,
    define: {
        "import.meta.env.commitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH.slice(0, 7)) : JSON.stringify(null),
        "import.meta.env.longCommitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify(null),
        "process.env.develop": "false"
    }
})
log("ESM build success")

const platforms = process.argv[2] ? [ process.argv[2] ] : [
    "bun-linux-x64",
    "bun-linux-arm64",
    "bun-windows-x64",
    // "bun-windows-arm64",
    "bun-darwin-x64",
    "bun-darwin-arm64",
    "bun-linux-x64-musl",
    "bun-linux-arm64-musl"
]

process.chdir("dist")

for (const platform of platforms) {
    log(`${platform} build start`)
    const outfile = `${name}-v${version}-${platform.slice(4)}`
    execSync(`bun build ${bundlefileName} --compile --target=${platform} --sourcemap --outfile "${outfile}"`)
    log(`${platform} build success`)
}
