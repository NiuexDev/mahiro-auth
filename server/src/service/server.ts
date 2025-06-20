// import { useRouter } from "@/router"
import { createApp, sendWebResponse, defineEventHandler, getRequestIP, setResponseHeader, getHeader, toNodeListener, setResponseHeaders, getRequestHeader } from "h3"
import { createServer } from "http"
import { createServer as createNatServer } from "net"
import { useConfig } from "@/service/config"
import { getLogger } from "@/service/logger"
import { useRouter } from "@/service/router"
import "@/router/index"
import { type Logger } from "winston"


let logger: Logger

export const startServer = async () => {

    const config = await useConfig()
    logger = getLogger("server")

    const app = createApp({
        onError(error, event) {
            sendWebResponse(event, new Response(null, { status: error.statusCode, /*statusText:  */}))
            logger.error(`${error.statusCode} - ${error.message}`)
            if (error.statusCode === 404) {
                logger.warn(`未找到路由：${event.path}`)
            }
            if (error.statusCode === 500) {
                logger.error(error.stack ?? "无栈信息")
            }
            return
        }
    })

    // 记录请求
    if (config.server.log.logRequest) {
        app.use(defineEventHandler((event)=>{
            // output> [RequestIP] or [远程地址] | [事件类型] => [事件路径] ??? // 事件 => http方法
            logger.info(`${event.method} ${getRequestIP(event) ?? event.node.req.socket.remoteAddress} -> ${event.path}`)
        }))
    }

    if (config.server.cors === true) {
        app.use(defineEventHandler((event)=>{
            if (event.method === "OPTIONS") {
                sendWebResponse(event, new Response(null, {status: 204, headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, TRACE, CONNECT",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Max-Age": "3153600000"
                }}))
            } else {
                setResponseHeaders(event, {
                    "Access-Control-Allow-Origin": "*"
                })
            }
        }))
    } else if (Array.isArray(config.server.cors) && config.server.cors.length > 0) {
        app.use(defineEventHandler((event)=>{
            if (!(config.server.cors as string[]).includes(getHeader(event, "Origin"))) return
            if (event.method === "OPTIONS") {
                setResponseHeaders(event, {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS, TRACE, CONNECT",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Max-Age": "3153600000"
                })
                return null
            } else {
                setResponseHeaders(event, {
                    "Access-Control-Allow-Origin": "*"
                })
            }
        }))
    }

    app.use(await useRouter())

    const port = await checkPort(config.server.port)
    createServer(toNodeListener(app)).listen(port, config.server.host)
    logger.info(`服务已运行于：http://${config.server.host}:${port}，YggdrasilAPI位于：${config.server.yggdrasilApiUrl}`)
}

const checkPort = async (port: number) => {
    let initialPort = port
    let i = 0
    while (true) {
        i++
        const server = createServer()
        const occupied = await new Promise(
            (resolve, reject) => {
                server.once("error", () => {
                    server.close()
                    resolve(true)
                })
                server.once("listening", () => {
                    server.close()
                    resolve(false)
                })
                server.listen(port)
            }
        )
        if (!occupied) {
            return port
        } else {
            logger.warn(`端口${port}已被占用`)
            if (port == 65535 || i > 10) {
                break
            }
            port++
            logger.info(`尝试使用端口${port}`)
        }
    }
    logger.error(`在端口${initialPort}至端口${port}范围内，无可用端口`)
    process.exit(1)
}