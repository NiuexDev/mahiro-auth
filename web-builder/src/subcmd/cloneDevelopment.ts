import { octokit, meta } from "@/main"
import AdmZip from "adm-zip"
import { execSync } from "child_process"
import { error } from "console"
import { access, constants, rm, writeFile, readdir, rename, unlink } from "fs/promises"
import ora from "ora"
import { join } from "path"


export const cloneDevelopment = async () => {
    try {
        access("code", constants.F_OK)
        rm("code", { recursive: true, force: true })
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    try {
        access("code.zip", constants.F_OK)
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
        error("code.zip not found")
        process.exit(1)
    }

    const zip = new AdmZip("code.zip")
    zip.extractAllTo("zip/", true)
    await rename(join("zip/", (await readdir("zip/"))[0] ?? (() => {error("code dir not found"); process.exit(1)})()), "code/")
    await rm("zip/", { recursive: true, force: true })
    await unlink("code.zip")

    const spinner2 = ora({ text: '正在构建dev分支configBuilder...', color: "yellow" })
    spinner2.start()
    execSync("bun install", { cwd: "code/web/" })
    execSync("bun run build:config", { cwd: "code/web/" })
    await rename("code/web/dist/config.js", "code/web/configBuilder.ts")
    spinner2.succeed("构建完成")
    spinner2.stop()
}
