import { createApp, defineEventHandler, getHeader, getRequestIP, sendWebResponse, setResponseHeader, toNodeListener } from "h3"
import { useConfig } from "./service/config"
import { getLogger } from "@/service/logger"
import { useRouter } from "@/router"
import { initDatabase } from "@/service/database"
import { joinUrl } from "@/util/url"
import { version } from "@/../info"
import { createServer } from "node:http"
import "@/service/email"
await initDatabase()

const config = await useConfig()
const logger = getLogger()

logger.info("启动服务中。")

const app = createApp({
    onError(error, event) {
        if (error.statusCode === 404) {
            sendWebResponse(event, new Response(null, {status: 404}))
        }
    }
})

if (config.server.log.logRequest) {
    app.use(defineEventHandler((event)=>{
        logger.info(`${getRequestIP(event) || event.node.req.socket.remoteAddress} | ${event.method} => ${event.path}`)
    }))
}

if (config.server.corsOrigins.includes("*")) {
    app.use(defineEventHandler((event)=>{
        setResponseHeader(event, "Access-Control-Allow-Origin", "*")
    }))
} else if (config.server.corsOrigins.length > 0) {
    app.use(defineEventHandler((event)=>{
        const origin = getHeader(event, "Origin")
        if (config.server.corsOrigins.includes(origin)) setResponseHeader(event, "Access-Control-Allow-Origin", origin)
    }))
}

app.use(useRouter())

createServer(toNodeListener(app)).listen(config.server.port, config.server.host)

logger.info(`启动成功，当前版本：v${version}。`)
logger.info(`服务已运行于：http://${config.server.host}:${config.server.port}，YggdrasilAPI位于：${joinUrl(config.server.apiBaseUrl)}。`)