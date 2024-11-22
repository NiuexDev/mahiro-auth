import { createApp, createRouter, defineEventHandler, getHeader, getRequestHost, setResponseHeader, toWebHandler } from "h3"
import { useConfig, loadConfig } from "./service/config"
import { getLogger } from "@/service/logger"
import { useRouter } from "@/router"
import { initDatabase } from "@/service/database"
import { joinUrl } from "@/util/url"
await loadConfig()
await initDatabase()

const config = useConfig()
const logger = getLogger()

logger.info("启动服务中。")

const app = createApp({
    debug: true,
    onBeforeResponse(event) {
        logger.debug(`${event.node.req.method} => ${event.node.req.url}`)
    },
})

app.use(defineEventHandler((event)=>{
    const origin = getHeader(event, "Origin")
    if (config.server.corsOrigins.includes(origin)) setResponseHeader(event, "Access-Control-Allow-Origin", origin)
}))

app.use(useRouter())

const server = Bun.serve({
    hostname: config.server.host,
    port: config.server.port,
    fetch: toWebHandler(app) as any,
})

logger.info(`启动成功。`)
logger.info(`服务已运行于：http://${server.hostname}:${server.port}，YggdrasilAPI位于：${joinUrl(config.server.apiBaseUrl)}。`)