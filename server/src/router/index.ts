import { createRouter, defineEventHandler, useBase } from "h3"
import "@/api/root"
import { applyRoutes } from "@/router/add"
import { useYggdrasil } from "@/router/yggdrasil"
import { useConfig } from "@/service/config"
import { joinUrl } from "@/util/url"

// import Root from "@/api/root"
import Register from "@/api/register"
import Code from "@/api/code"



export async function useRouter() {
    const config = await useConfig()
    const router = createRouter()
    applyRoutes(router)
    router.use(joinUrl(config.server.yggdrasilApiUrl, "/**"), useBase(joinUrl(config.server.yggdrasilApiUrl), useYggdrasil().handler))
    // router.get("/", Root)
    router.post("/register", Register)
    router.post("/code", Code)
    return router
}