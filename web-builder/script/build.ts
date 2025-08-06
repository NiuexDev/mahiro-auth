import { access, constants, mkdir } from "node:fs/promises"

try {
    await access("dist", constants.F_OK)
} catch (e) {
    await mkdir("dist")
}

await Bun.build({
    entrypoints: ["src/main.ts"],
    packages: "bundle",
    target: "node",
    format: "esm",
    outdir: "dist/",
    naming: "web-builder.js",
    define: {
        "import.meta.env.commitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH.slice(0, 7)) : JSON.stringify("development"),
        "import.meta.env.longCommitHash": process.env.COMMIT_HASH ? JSON.stringify(process.env.COMMIT_HASH) : JSON.stringify("development"),
        "import.meta.env.develop": JSON.stringify(false)
    }
})