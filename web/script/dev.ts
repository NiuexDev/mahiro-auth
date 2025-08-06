import { createServer } from "vite"
import config from "./vite-config"

const server = await createServer(config)
await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })