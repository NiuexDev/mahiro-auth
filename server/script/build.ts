import { execSync } from "node:child_process"
import { log } from "node:console"
import { access, constants, mkdir } from "node:fs/promises"
import { name, version } from "../package.json" with { type: "json" }

try {
    await access("dist", constants.F_OK)
} catch (e) {
    await mkdir("dist")
}

const bundleFileName = `${name}-v${version}-bundle.js`
await Bun.build({
    entrypoints: ["src/main.ts"],
    outdir: "dist/",
    target: "node",
    format: "esm",
    naming: bundleFileName,
    define: {
        "import.meta.env.commitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH.slice(0, 7)) : JSON.stringify(null),
        "import.meta.env.longCommitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify(null),
        "process.env.develop": JSON.stringify(false)
    }
})

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
    execSync(`bun build ${bundleFileName} --compile --target=${platform} --sourcemap --outfile "${outfile}"`)
    log(`${platform} build success`)
}
