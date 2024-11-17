import { createApp, createRouter, defineEventHandler, toWebHandler } from "h3"
import { getConfig, loadConfig } from "./service/config"

await loadConfig()
const config = getConfig()

const app = createApp({
    debug: true
})
const router = createRouter()
app.use(router)

const server = Bun.serve({
    hostname: config.server.host,
    port: config.server.port,
    fetch: toWebHandler(app) as any,
})
