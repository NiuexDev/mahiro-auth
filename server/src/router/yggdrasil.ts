import { createRouter, defineEventHandler, useBase } from "h3"

export function useYggdrasil() {
    const router = createRouter()
    return router
}