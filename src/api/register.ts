import { defineEventHandler } from "h3"

export default defineEventHandler(async (event) => {
    return {
        name: "Yggdrasil",
        version: "1.0.0"
    }
})