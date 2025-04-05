import { createApp, defineEventHandler, getHeader, getRequestIP, sendWebResponse, setResponseHeader, toNodeListener } from "h3"
import { useConfig } from "./service/config"
import { getLogger } from "@/service/logger"
import { useRouter } from "@/router"
import { initDatabase } from "@/service/database"
import { joinUrl } from "@/util/url"
import { name, version } from "@/../package.json"
import { createServer } from "node:http"
import "@/service/email"

const config = await useConfig()
await initDatabase()
const logger = getLogger()

logger.info("启动服务中。")

// 捕获并处理报错
const app = createApp({
    onError(error, event) {
        // 匹配 404 错误码并处理
        if (error.statusCode === 404) {
            sendWebResponse(event, new Response(null, {status: 404}))
        }
    }
})

// 记录请求
if (config.server.log.logRequest) {
    app.use(defineEventHandler((event)=>{
        // output> [RequestIP] or [远程地址] | [事件类型] => [事件路径] ???
        logger.info(`${getRequestIP(event) ?? event.node.req.socket.remoteAddress} | ${event.method} => ${event.path}`)
    }))
}

if (config.server.corsOrigins.includes("*")) {
    app.use(defineEventHandler((event)=>{
        setResponseHeader(event, "Access-Control-Allow-Origin", "*") // 允许在任何域中调用本站api，避免因防跨站导致无法访问
    }))
} else if (config.server.corsOrigins.length > 0) {
    app.use(defineEventHandler((event)=>{
        const origin = getHeader(event, "Origin")
        // 设置响应头中，允许的域的范围
        if (config.server.corsOrigins.includes(origin)) setResponseHeader(event, "Access-Control-Allow-Origin", origin)
    }))
}

app.use(useRouter())

const port = await ( async () => {
    let port = config.server.port
    let i = 0
    while (true) {
        i++
        const occupied = await new Promise(
            (resolve) => {
                const server = createServer().listen(port)
                server.on("listening", () => {
                    server.close()
                    resolve(false)
                })
                server.on("error", () => { 
                    server.close()
                    resolve(true)
                })
            }
        )
        if (!occupied) {
            return port
        } else {
            logger.warn(`端口${port}已被占用。`)
            if (port == 65535 || i > 10) {
                break
            }
            port++
            logger.info(`尝试使用端口${port}。`)
        }
    }
    logger.error(`在端口${config.server.port}至端口${port}范围内，无可用端口。`)
    process.exit(1)
})()
createServer(toNodeListener(app)).listen(port, config.server.host)

logger.info(`${name} v${version}. 启动成功。`)
logger.info(`服务已运行于：${config.server.host}:${port}，YggdrasilAPI位于：${joinUrl(config.server.apiBaseUrl)}.`)