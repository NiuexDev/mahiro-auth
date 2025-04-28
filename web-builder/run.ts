import AdmZip from 'adm-zip'
import { execSync } from "child_process"
import { error, log, warn } from "console"
import { access, constants, readdir, readFile, rename, rmdir, stat, unlink, writeFile } from "fs/promises"
import { createServer } from "http"
import { Octokit } from "octokit"
import ora from 'ora'
import handler from "serve-handler"
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"
import { name, version } from "./package.json"

if (import.meta.env.develop) {
    process.chdir("run")
}

const octokit = new Octokit()
const meta = {
    owner: "NiuexDev",
    repo: "mahiro-auth",
}

const clone = async () => {
    const spinner1 = ora({ text: '正在获取最新版本...', color: "yellow" })
    spinner1.start()
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
    const b = (await readdir(".")).find(name => /^NiuexDev-mahiro-auth-/.test(name))
    if (b === undefined) throw new Error("release not found")
    await rename(b, "code")
    await unlink("code.zip")
    const configData = await (await fetch(release.assets[0].browser_download_url, { method: "GET" })).arrayBuffer()
    await writeFile("code/web/configBuilder.ts", Buffer.from(configData), "utf-8")

    const configBuilder = await import(process.cwd()+"/code/web/configBuilder.ts")
    const commitHash = configBuilder.commitHash
    await writeFile(
        "code/web/vite.config.ts",
        (await readFile("code/web/vite.config.ts", "utf-8")).replace("__COMMIT_HASH__", commitHash),
        "utf-8"
    )
    
    spinner2.succeed("下载完成")
    spinner2.stop()
}

const initConfig = async (overwrite: boolean = false) => {
    log("正在初始化配置文件...")
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
                warn("config.yml 已经存在，如需要覆盖请使用\`--overwrite\`参数")
                process.exit(1)
            }
        }
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
    }
    await writeFile("config.yml", configText)
    log("初始化完成")
}

const verifyConfig = async () => {
    log("正在验证配置文件...")
    const configBuilder = await import(process.cwd()+"/code/web/configBuilder.ts")

    const data = await readFile("config.yml", "utf-8")
    const result = configBuilder.verifyConfig(parseYaml(data))
    if (result === true) {
        log("配置文件验证通过")
        return
    }
    result.forEach((result: any) => 
        error( `配置项：\`${result.path}\` ${result.reason}，当前值：${JSON.stringify(result.value)}`)
    )
    error("配置文件验证失败")
    process.exit(1)
}

const pack = async () => {
    log("正在打包...")
    const configYaml = await readFile("config.yml", "utf-8")
    const config = JSON.stringify(parseYaml(configYaml))
    const configTsData = "export const config = " + config
    await writeFile("code/web/config.ts", configTsData, "utf-8")
    const bunPath = "bun"

    const spinner1 = ora({  text: '正在安装依赖...', color: "green" })
    spinner1.start()
    execSync(`${bunPath} install`, { cwd: "code/web" })
    spinner1.succeed("依赖安装完成")
    spinner1.stop()

    const spinner2 = ora({ text: '正在构建...', color: "cyan" })
    spinner2.start()
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

const preview = async (port: number = 20721) => {
    try {
        await access("dist", constants.F_OK)
        const distDir = await stat("dist")
        if (distDir.isFile()) {
            error("dist 不是目录")
            process.exit(1)
        }
    } catch (e) {
        if (e.code !== 'ENOENT') throw e
        error("目录 dist 不存在")
        process.exit(1)
    }
    log("正在启动本地服务器...")
    const server = createServer(async (request, response) => {
        await handler(
            request,
            response,
            {
                public: "dist",
                cleanUrls: true,
                rewrites: [
                    { source: '**', destination: '/index.html' }
                ]
            }
        )
    })
    server.listen(port, () => {
        console.log(`服务器已启动于 http://localhost:${port}`)
    })
}

log(`\n${name} v${version}(${import.meta.env.commitHash})\n`)

const helpInfo = 
`所有命令：
 - init                     初始化
 - clone                    下载源码
 - initConfig [--overwrite] 初始化配置文件，传入\`--overwrite\`参数时会覆盖已存在的配置文件
 - build                    构建
 - verifyConfig             验证配置文件
 - pack                     打包
 - preview [--port=number]  预览，传入\`--port=number\`参数时会将会在number端口启动服务器，默认端口为20721
 - help                     显示帮助信息
 - version                  显示版本信息`

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
        case "preview":
            const arg = args.slice(1).find(arg => /^--port=/.test(arg))
            if (arg) {
                await preview(Number(arg.slice(7)))
            } else {
                await preview()
            }
            break
        case "help":
            log(helpInfo)
            break
        case "version":
            log(`version ${version} commit ${import.meta.env.longCommitHash}`)
            break
        default:
            error("未知的命令：" + args[0])
            log(helpInfo)
            break
    }
}