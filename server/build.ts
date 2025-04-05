import { build, BuildOptions, SameShape } from "esbuild"
import packageJson from "./package.json" assert { type: "json" }
import { writeFile, mkdir, access, constants } from "fs/promises"
import { $ } from "bun"
import { log } from "console"

try {
    await access("dist", constants.F_OK)
} catch (e) {
    await mkdir("dist")
}
  
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
    outfile: "dist/app.mjs",
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


for (const platform of platforms) {
    log(`${platform} build start`)
    await $`bun build src/main.ts --compile --target=${platform} --sourcemap --outfile "dist/${packageJson.name}_v${packageJson.version}_${platform}"`
    log(`${platform} build success`)
}
