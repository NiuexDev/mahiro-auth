import AdmZip from "adm-zip"
import { access, constants, stat, rmdir, unlink, writeFile, readdir, rename } from "fs/promises"
import ora from "ora"
import { octokit, meta } from "@/main"

export const clone = async () => {
    const spinner1 = ora({ text: '正在获取最新版本...', color: "yellow" })
    spinner1.start()
    let release = null
    let page = 1
    do {
        const { data: releaseList } = await octokit.rest.repos.listReleases({
            owner: meta.owner,
            repo: meta.repo,
            page
        })
        release = releaseList.find(({ tag_name }) => tag_name.includes("web-v"))
        page++
    } while (release === null)
    release = release!
    spinner1.succeed(`当前最新版本：${release.tag_name.slice(5)}`)
    spinner1.stop()

    const spinner2 = ora({ text: '正在下载...', color: "green" })
    spinner2.start()
    try {
        access("code.zip", constants.F_OK)
        const oldCodeTargz = await stat("code.zip")
        if (oldCodeTargz.isDirectory()) {
            await rmdir("code.zip")
        }
        if (oldCodeTargz.isFile()) {
            await unlink("code.zip")
        }
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }


    if (release.zipball_url === null) {
        throw new Error("release not found")
    }
    const codeData = await (await fetch(release.zipball_url, { method: "GET" })).arrayBuffer()
    writeFile("code.zip", Buffer.from(codeData), "binary")

    try {
        access("code", constants.F_OK)
        const codeDir = await stat("code")
        if (codeDir.isFile()) {
            await unlink("code")
        }
        if (codeDir.isDirectory()) {
            await rmdir("code", { recursive: true })
        }
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    const zip = new AdmZip("code.zip")
    zip.extractAllTo(".", true)
    const b = (await readdir(".")).find(name => new RegExp(`^${meta.owner}-${meta.repo}-`).test(name))
    if (b === undefined) throw new Error("release not found")
    await rename(b, "code")
    await unlink("code.zip")
    const configData = await (await fetch(release.assets[0].browser_download_url, { method: "GET" })).arrayBuffer()
    await writeFile("code/web/configBuilder.ts", Buffer.from(configData), "utf-8")
    spinner2.succeed("下载完成")
    spinner2.stop()
}