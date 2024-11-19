import { defineEventHandler } from "h3"

export default defineEventHandler(() => {
    return {
        title: "string",
        description: "string",
        
        allowUseUsernameLogin: true
    }
})