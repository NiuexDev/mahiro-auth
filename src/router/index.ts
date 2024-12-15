import { createRouter, defineEventHandler, useBase } from "h3"
import { useYggdrasil } from "@/router/yggdrasil"
import { useConfig } from "@/service/config"
import { joinUrl } from "@/util/url"

import Meat from "@/api/meta"
import Register from "@/api/register"
import Code from "@/api/code"

const config = await useConfig()

export function useRouter() {
    const router = createRouter()
    router.use(joinUrl(config.server.apiBaseUrl, "/**"), useBase(joinUrl(config.server.apiBaseUrl), useYggdrasil().handler))
    router.get("/meta", Meat)
    router.post("/register", Register)
    router.post("/code", Code)
    return router
}