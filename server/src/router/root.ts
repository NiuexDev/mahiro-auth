import { name, version } from "@/../package.json"
import { setRouter } from "@/service/router"
import { eventHandler } from "h3"

setRouter("get", "/", eventHandler(() => {
    return `Moe Mahiro! ${name} v${version}(${import.meta.env.commitHash})`
}))