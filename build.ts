import { dependencies } from "./package.json" assert { type: "json" }
import { build } from "esbuild"
import { writeFile, mkdir } from "fs/promises"
try {
    await mkdir("dist")
} catch(e) {}
await build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outfile: "dist/app.js",
    packages : "external",
    platform: "node",
    target: "esnext",
    format: "esm"
})
// Reflect.deleteProperty(packageJson, "devDependencies")
await writeFile("dist/package.json", JSON.stringify({
    type: "module",
    dependencies
}))