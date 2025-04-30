import { Config, useConfig } from "@/service/config"
import { createRouter, EventHandler, HTTPMethod, Router, RouterMethod } from "h3"

let config: Config
const router = createRouter()

export const yggdrasilUrl = (utl: string) => {
    return config.server.yggdrasilApiUrl + utl
}

export const setRouter = (method: RouterMethod | RouterMethod[], url: string, handler: EventHandler): void => {
    router.use(url, handler, method)
}

export async function useRouter() {
    config = await useConfig()
    return router
}