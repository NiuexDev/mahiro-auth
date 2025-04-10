import { name, version } from "@/../package.json"
import { initConfig } from "@/service/config"
import { getLogger } from "@/service/logger"
import { startServer } from "@/service/server"
import * as console from "node:console"
import { access, constants, mkdir } from "node:fs/promises"
import { logo } from "~/logo"

const versionStr = `v${version} (${process.env.commitHash?.slice(0, 7)})`
console.info()
console.info(logo)
console.info()
console.info(name + String().padEnd(logo.split("\n").at(-1)!.length-name.length-versionStr.length, " ") + versionStr)
console.info()

try {
    await access("data", constants.F_OK)
} catch (e) {
    try {
        await mkdir("data")
    } catch (e) {
        console.error("创建数据目录失败")
        throw e
    }
}
try {
    process.chdir("data")
} catch (e: any) {
    console.error("无法读写数据目录")
    throw e
}

const logger = getLogger("main")
logger.info("正在启动服务")
await initConfig()
await startServer()