import { name, version, dependencies } from "../package.json" with { type: "json" }
import { mkdir, access, constants, rmdir, cp, writeFile, rm } from "node:fs/promises"
import { log } from "node:console"
import { execSync } from "node:child_process"

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

// process.exit()

// const externalFileName = `${name}-v${version}-external.js`
// const bundleFileName = `${name}-v${version}-bundle.js`

// const esbuildConfig: SameShape<BuildOptions, any> = {
//     entryPoints: ["src/main.ts"],
//     bundle: true,
//     platform: "node",
//     target: "esnext",
//     keepNames: true,
//     minifySyntax: true,
//     loader: {
//       ".html": "text"
//     },
//     format: "esm",
//     define: {
//         "import.meta.env.commitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH.slice(0, 7)) : JSON.stringify(null),
//         "import.meta.env.longCommitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify(null),
//         "process.env.develop": JSON.stringify(false)
//     }
// }

// // ESM 构建配置
// log("ESM-external build start")
// await build({
//     ...esbuildConfig,
//     packages: "external",
//     outfile: `dist/${externalFileName}`,
// })
// await writeFile("dist/package.json", JSON.stringify({ type: "module", dependencies}))
// const zip = new AdmZip()
// zip.addLocalFile(`dist/package.json`)
// zip.addLocalFile(`dist/${externalFileName}`)
// await zip.writeZipPromise(`dist/${name}-v${version}.zip`)
// await rm("dist/package.json")
// await rm(`dist/${externalFileName}`)

// log("ESM external success")

// log("ESM-bundle build start")
// await build({
//     ...esbuildConfig,
//     packages: "bundle", // 自动处理依赖
//     outfile: `dist/${bundleFileName}`,
// })
// log("ESM build success")


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
