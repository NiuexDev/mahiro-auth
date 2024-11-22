import { dependencies } from "./package.json" assert { type: "json" }
import { build } from "esbuild"
import { writeFile } from "fs/promises"
build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outfile: "app.js",
    packages : "external",
    platform: "node",
    target: "esnext",
    format: "esm",
})
writeFile("package.json", JSON.stringify({dependencies}))