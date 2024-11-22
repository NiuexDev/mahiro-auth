import { build } from "esbuild"
build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outfile: "app.js",
    packages : "external",
    platform: "node",
    target: "esnext",
    format: "esm",
})