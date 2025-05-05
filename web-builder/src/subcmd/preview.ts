import { error, log } from "console"
import { access, stat, constants } from "fs/promises"
import { createServer } from "http"
import handler from "serve-handler"

export const preview = async (port: number = 20721) => {
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
