import { name, version } from "@/../package.json"
import { initConfig } from "@/service/config"
import { initEmail, sendTemplate } from "@/service/email"
import { getLogger } from "@/service/logger"
import { startServer } from "@/service/server"
import { access, constants, mkdir } from "node:fs/promises"
import { logo } from "~/logo"
import { tryCatch } from "~/util/try-catch"
import "~/util/class-instance"
import { commandRunner } from "@/service/cmd"
import { initDatabase } from "@/service/database"
import { shortCommitHash } from "@/assets/commitHash"

const versionStr = `v${version} (${shortCommitHash})`
console.info()
console.info(logo)
console.info()
console.info(name + String().padEnd(logo.split("\n").at(-1)!.length-name.length-versionStr.length, " ") + versionStr)
console.info()

commandRunner()

const { error } = await tryCatch(access("data", constants.F_OK))
if (error) {
    const { error } = await tryCatch(mkdir("data"))
    if (error) {
        console.error("创建数据目录失败")
        throw error
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
await initDatabase()
await initEmail()
await startServer()
logger.info("服务已启动")