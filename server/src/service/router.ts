import { Config, useConfig } from "@/service/config"
import { createRouter, Router } from "h3"

let config: Config
const router = createRouter()

export const yggdrasilUrl = (utl: string) => {
    return config.server.yggdrasilApiUrl + utl
}

export const setRouter = (configureRouter: (router: Router) => void): void => {
    configureRouter(router)
}

export async function useRouter() {
    config = await useConfig()
    return router
}