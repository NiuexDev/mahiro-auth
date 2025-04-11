import { name, version } from "@/../package.json"
import { setRouter } from "@/service/router"
import { defineEventHandler } from "h3"

setRouter((router) => {
    router.use("/", defineEventHandler((event) => {
        return `Moe Mahiro! ${name} v${version} (${import.meta.env.commitHash})`
    }))
})