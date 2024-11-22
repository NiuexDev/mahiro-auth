import { defineEventHandler } from "h3"

export default defineEventHandler(() => {
    return {
        title: "北屿验证",
        description: "string",
        
        allowUseUsernameLogin: true
    }
})