import { createRouter, defineEventHandler, useBase } from "h3"
import { useYggdrasil } from "@/router/yggdrasil"
import { useConfig } from "@/service/config"
import { joinUrl } from "@/util/url"

import MeatApi from "@/api/meta"
import RegisterApi from "@/api/register"

export function useRouter() {
    const config = useConfig()
    const router = createRouter()
    router.use(joinUrl(config.server.apiBaseUrl, "/**"), useBase(joinUrl(config.server.apiBaseUrl), useYggdrasil().handler))
    router.get("/meta", MeatApi)
    router.get("/register", RegisterApi)
    return router
}