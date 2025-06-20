import { type Config, useConfig } from "@/service/config"
import type {EventHandler, HTTPMethod, Router, RouterMethod } from "h3"
import { createRouter } from "h3"
import { useBaseUrl } from "~/util/useBaseUrl"

let config: Config
const router = createRouter()

export const yggdrasilUrl = (utl: string) => {
    return useBaseUrl(config.server.yggdrasilApiUrl, utl)
}

export const setRouter = (method: RouterMethod | RouterMethod[], url: string, handler: EventHandler): void => {
    router.use(url, handler, method)
}

export const useRouter = async () => {
    config = await useConfig()
    return router
}