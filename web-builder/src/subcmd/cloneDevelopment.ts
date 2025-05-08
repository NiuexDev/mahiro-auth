import { octokit, meta } from "@/main"
import AdmZip from "adm-zip"
import { execSync } from "child_process"
import { access, constants, rm, writeFile, readdir, rename, unlink } from "fs/promises"
import ora from "ora"


export const cloneDevelopment = async () => {
    const spinner1 = ora({ text: '正在下载dev分支代码...', color: "yellow" })
    spinner1.start()
    const response = await octokit.rest.repos.downloadZipballArchive({
        owner: meta.owner,
        repo: meta.repo,
        ref: "dev"
    }) as { data: ArrayBuffer, status: number }
    if (!(response.status === 200) || !response.data) throw new Error("dev code not found")
    try {
        access("code.zip", constants.F_OK)
        rm("code.zip", { recursive: true, force: true })
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    await writeFile("code.zip", Buffer.from(response.data), "binary")

    try {
        access("code", constants.F_OK)
        rm("code", { recursive: true, force: true })
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }

    const zip = new AdmZip("code.zip")
    zip.extractAllTo(".", true)
    const b = (await readdir(".")).find(name => new RegExp(`^${meta.owner}-${meta.repo}-`).test(name))
    if (b === undefined) throw new Error("release not found")
    await rename(b, "code")
    await unlink("code.zip")

    spinner1.succeed("下载完成")
    spinner1.stop()

    const spinner2 = ora({ text: '正在构建dev分支configBuilder...', color: "yellow" })
    spinner2.start()
    execSync("bun install", { cwd: "code/web/" })
    execSync("bun run build:config", { cwd: "code/web/" })
    await rename("code/web/dist/config.js", "code/web/configBuilder.ts")
    spinner2.succeed("构建完成")
    spinner2.stop()
}
