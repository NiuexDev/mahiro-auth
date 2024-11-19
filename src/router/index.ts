import { createRouter, defineEventHandler, useBase } from "h3"
import { useYggdrasil } from "./yggdrasil"
import { useConfig } from "../service/config"
import { join } from "node:path"

import MeatApi from "@/api/meta"

export function useRouter() {
    const config = useConfig()
    const router = createRouter()
    router.use(join("/", config.server.apiBaseUrl, "/**").replaceAll("\\", "/"), useBase(join("/", config.server.apiBaseUrl).replaceAll("\\", "/"), useYggdrasil().handler))
    router.get('/meta', MeatApi)
    return router
}