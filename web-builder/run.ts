import { error, log, warn } from "console"
import { name, version } from "./package.json"
import { Octokit } from "octokit"
import { writeFile } from "fs/promises"
import { stat } from "fs/promises"
import { rmdir } from "fs/promises"
import { unlink } from "fs/promises"
import AdmZip from 'adm-zip'
import { constants } from "fs/promises"
import { access } from "fs/promises"
import { readdir } from "fs/promises"
import { rename } from "fs/promises"
import { parse, stringify } from "yaml"
import { execSync } from "child_process"

log(`${name} v${version}(${process.env.commitHash})`)

if (process.env.develop) {
    process.chdir("run")
}

const octokit = new Octokit()
const meta = {
    owner: "NiuexDev",
    repo: "mahiro-auth",
}


const clone = async () => {

    let release = undefined
    let page = 1
    do {
        const { data: releaseList } = await octokit.rest.repos.listReleases({
            owner: meta.owner,
            repo: meta.repo,
            page
        })
        release = releaseList.find(({ tag_name }) => tag_name.includes("web-v"))
        page++
    } while (release === undefined)


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
    // await mkdir("code")
    const zip = new AdmZip("code.zip")
    zip.extractAllTo(".", true)
    const b = (await readdir(".")).find(name => /^NiuexDev-mahiro-auth-/.test(name))
    if (b === undefined) throw new Error("release not found")
    await rename(b, "code")
    await unlink("code.zip")

    if (release.assets[0].url) throw new Error("configBuilder cont download")

    const configData = await (await fetch(release.assets[0].url, { method: "GET" })).arrayBuffer()
    await writeFile("code/web/configBuilder.ts", Buffer.from(configData), "utf-8")
}

const initConfig = async (overwrite: boolean = false) => {
    const configBuilder = await import(process.cwd()+"/code/web/configBuilder.ts")
    const config = configBuilder.createConfig()
    const configText = stringify(config)
    try {
        await access("config.yml", constants.F_OK)
        const a = await stat("config.yml")
        if (a.isDirectory()) {
            await rmdir("config.yml", { recursive: true })
        }
        if (a.isFile()) {
            if (overwrite) {
                await unlink("config.yml")
            } else {
                warn("config.yml 已经存在，如需要覆盖请使用 --overwrite 参数")
                process.exit(1)
            }
        }
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    await writeFile("config.yml", configText)
}

initConfig()
// clone()