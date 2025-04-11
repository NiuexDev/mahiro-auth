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
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"
import { exec, execFileSync, execSync } from "child_process"
import { readFile } from "fs/promises"
import ora from 'ora'

if (process.env.develop) {
    process.chdir("run")
}

const octokit = new Octokit()
const meta = {
    owner: "NiuexDev",
    repo: "mahiro-auth",
}

const clone = async () => {

    
    const spinner1 = ora({ text: '正在获取最新版本...', color: "yellow" })
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
    spinner1.succeed(`当前最新版本：${release.tag_name.slice(5)}`)
    spinner1.stop()

    const spinner2 = ora({ text: '正在下载...', color: "green" })
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
    const configData = await (await fetch(release.assets[0].browser_download_url, { method: "GET" })).arrayBuffer()
    await writeFile("code/web/configBuilder.ts", Buffer.from(configData), "utf-8")
    spinner2.succeed("下载完成")
    spinner2.stop()
}

const initConfig = async (overwrite: boolean = false) => {
    const configBuilder = await import(process.cwd()+"/code/web/configBuilder.ts")
    const config = configBuilder.createConfig()
    const configText = stringifyYaml(config)
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

const verifyConfig = async () => {
    const configBuilder = await import(process.cwd()+"/code/web/configBuilder.ts")

    const data = await readFile("config.yml", "utf-8")
    const result = configBuilder.verifyConfig(parseYaml(data))
    if (result === true) return true
    result.forEach((result: any) => 
        error( `配置项：\`${result.path}\` ${result.reason}，当前值：${JSON.stringify(result.value)}`)
    )
    return false
}

const pack = async () => {
    const configYaml = await readFile("config.yml", "utf-8")
    const config = JSON.stringify(parseYaml(configYaml))
    const configTsData = "export const config = " + config
    await writeFile("code/web/config.ts", configTsData, "utf-8")
    const bunPath = "bun"

    const spinner1 = ora({  text: '正在安装依赖...', color: "green" })
    execSync(`${bunPath} install`, { cwd: "code/web" })
    spinner1.succeed("依赖安装完成")
    spinner1.stop()

    const spinner2 = ora({ text: '正在构建...', color: "cyan" })
    execSync(`${bunPath} run build`, { cwd: "code/web" })
    spinner2.succeed("构建完成")
    spinner2.stop()

    try {
        await access("dist", constants.F_OK)
        const distDir = await stat("dist")
        if (distDir.isDirectory()) {
            await rmdir("dist", { recursive: true })
        }
        if (distDir.isFile()) {
            await unlink("dist")
        }
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    await rename("code/web/dist", "dist")
}

const init = async () => {
    await clone()
    await initConfig()
}

const build = async () => {
    await verifyConfig()
    await pack()
}
log(`\n${name} v${version} (${process.env.commitHash})\n`)

const helpInfo = 
`所有命令：
- init                     初始化
- clone                    下载源码
- initConfig [--overwrite] 初始化配置文件，传入\`--overwrite\`参数时会覆盖已存在的配置文件
- build                    构建
- verifyConfig             验证配置文件
- pack                     打包
- help                     显示帮助信息`

const args = process.argv.slice(2)
if (args.length === 0) {
    log(helpInfo)
} else {
    switch (args[0]) {
        case "init":
            await init()
            break
        case "clone":
            await clone()
            break
        case "initConfig":
            await initConfig(args.includes("--overwrite"))
            break
        case "build":
            await build()
            break
        case "verifyConfig":
            await verifyConfig()
           break
        case "pack":
            await pack()
            break
        case "help":
            log(helpInfo)
            break
        default:
            error("未知的命令")
            log(helpInfo)
            break
    }
}