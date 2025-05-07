import { octokit, meta } from "@/main"
import AdmZip from "adm-zip"
import { access, constants, rm, writeFile, readdir, rename, unlink } from "fs/promises"
import ora from "ora"


export const cloneDevelopment = async () => {
    const spinner1 = ora({ text: '正在下载dev分支代码...', color: "yellow" })
    spinner1.start()
    const response = await octokit.rest.repos.downloadZipballArchive({
        owner: meta.owner,
        repo: meta.repo,
        ref: "dev"
    }) as any
    if (!(response.data === 200) || !response.data) throw new Error("dev code not found")
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
}
