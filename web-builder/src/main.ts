import { error, log } from "console"
import { Octokit } from "octokit"
import { name, version } from "../package.json"
import { pack } from "./subcmd/pack"
import { preview } from "./subcmd/preview"
import { verifyConfig } from "./subcmd/verifyConfig"
import { initConfig } from "./subcmd/initConfig"
import { clone } from "./subcmd/clone"
import { cloneDevelopment } from "./subcmd/cloneDevelopment"

if (import.meta.env.develop) {
    process.chdir("run")
}

export const octokit = new Octokit()
export const meta = {
    owner: "NiuexDev",
    repo: "mahiro-auth",
} as const

const init = async () => {
    await clone()
    await initConfig()
}

const build = async () => {
    await verifyConfig()
    await pack()
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
            if (import.meta.env.develop && args.slice(1).includes("--develop")) {
                await cloneDevelopment()
                break
            }
            await clone()
            break
        case "initConfig":
            await initConfig(args.slice(1).includes("--overwrite"))
            break
        case "build":
            await build()
            break
        case "verifyConfig":
            await verifyConfig()
           break
        case "pack": {
            const arg = args.slice(1).find(arg => /^--bun-path=/.test(arg))
            if (arg) {
                await pack(arg.slice(11))
            } else {
                await pack()
            }
            break
        }
        case "preview": {
            const arg = args.slice(1).find(arg => /^--port=/.test(arg))
            if (arg) {
                await preview(Number(arg.slice(7)))
            } else {
                await preview()
            }
            break
        }
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