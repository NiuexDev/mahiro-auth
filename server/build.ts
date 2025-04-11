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

const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()

// ESM 构建配置
log("ESM build start")
await build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    packages: "bundle", // 自动处理依赖
    platform: "node",
    target: "esnext",
    keepNames: true,
    loader: {
      ".html": "text"
    },
    format: "esm",
    outfile: `dist/${name}_v${version}.js`,
    define: {
        "process.env.commitHash": JSON.stringify(commitHash),
    }
})
log("ESM build success")

const platforms = [
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
    execSync(`bun build ${name}_v${version}.js --compile --target=${platform} --sourcemap --outfile "${name}_v${version}_${platform}"`)
    log(`${platform} build success`)
}
