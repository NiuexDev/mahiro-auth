import { build, BuildOptions, SameShape } from "esbuild"
import packageJson from "./package.json" assert { type: "json" }
import { writeFile, mkdir, access, constants } from "fs/promises"
import { exec } from "node:child_process"
import { $ } from "bun"

try {
    await access("dist", constants.F_OK)
} catch (e) {
    await mkdir("dist")
}

const buildconfig: SameShape<BuildOptions, BuildOptions> = {
    entryPoints: ["src/main.ts"],
    bundle: true,
    packages : "external",
    platform: "node",
    target: "esnext",
    format: "esm",
    loader: {
        ".html": "text"
    }
}

await build({
    ...buildconfig,
    outfile: "dist/app.js",
    define: {
        "process.env.COMPILE_TYPE": JSON.stringify("code")
    }
})

await writeFile("dist/package.json", JSON.stringify({
    type: "module",
    dependencies: packageJson.dependencies
}))

await build({
    ...buildconfig,
    outfile: "dist/executable.js",
    define: {
        "process.env.COMPILE_TYPE": JSON.stringify("executable")
    }
})

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

// await Promise.all(
// const commands =
    // platforms.map(platform => {
    //     const command = `bun build --compile --target=${platform} dist/executable.js --outfile "dist/${packageJson.name}_v${packageJson.version}_${platform}"`
    //     return platform.includes("windows") ? command + " --windows-icon=src/assets/icon.ico" : command
    // })
    // .map(command => exec(command))
// )

// await $`bun build dist/executable.js --compile --outfile "dist/${packageJson.name}_v${packageJson.version}_"`

// await $`114514aaa ${commands[3]}`

for (const platform of platforms) {
    // console.log(command)
    await $`bun build --compile --target=${platform} dist/executable.js --outfile "dist/${packageJson.name}_v${packageJson.version}_${platform}" ${platform.includes("windows") ? " --windows-icon=src/assets/icon.ico" : ""}`
}