import { StringValidator } from "~/util/schema"

const isViteEnv = !!(
    typeof import.meta !== 'undefined' && 
    import.meta.env && 
    (import.meta.env.DEV || import.meta.env.PROD)
)

const configSchema = {
    apiBaseUrl: new StringValidator(isViteEnv ? "http://localhost:10721" : "/api"),
}

export const createConfig = () => {
    return {
        apiBaseUrl: isViteEnv ? "http://localhost:10721" : "/api",
        title: "北屿验证",
        description: "string",

        allowUseUsernameLogin: false
    }
}

export const config = createConfig()
