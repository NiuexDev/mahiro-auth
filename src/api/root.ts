import { defineEventHandler } from "h3"
import { name, version } from "@/../package.json"

export default defineEventHandler(() => {
    return `${name} v${version}. Hello World!`
})