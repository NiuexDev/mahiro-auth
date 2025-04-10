import { defineEventHandler, type H3Event, EventHandlerRequest } from "h3"
import { name, version } from "@/../package.json"
import { registerRoute } from "@/router/add"

// export default defineEventHandler(() => {
//     return `${name} v${version}. Hello World!`
// })
const A = (event: H3Event<EventHandlerRequest>) => {
    return `${name} v${version}. Moe Mahiro!`
}