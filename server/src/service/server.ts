// import { useRouter } from "@/router"
import { createApp, sendWebResponse, defineEventHandler, getRequestIP, setResponseHeader, getHeader, toNodeListener, setResponseHeaders, getRequestHeader } from "h3"
import { createServer } from "http"
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
            // 匹配 404 错误码并处理
            if (error.statusCode === 404) {
                sendWebResponse(event, new Response(null, {status: 404}))
            }
            if (error.statusCode === 500) {
                sendWebResponse(event, new Response(null, {status: 500}))
                logger.error(error)
            }
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