import { BooleanValidator, create, StringValidator, verify } from "~/util/schema"

const isViteEnv = !!(
    typeof import.meta !== 'undefined' && 
    import.meta.env && 
    (import.meta.env.DEV || import.meta.env.PROD)
)

type Config = {
    apiBaseUrl: string,
    title: string,
    description: string,
    allowUseUsernameLogin: boolean
}

const configSchema = {
    apiBaseUrl: new StringValidator(isViteEnv ? "http://localhost:10721" : "/api"),
    title: new StringValidator("まひろ验证"),
    description: new StringValidator("Moe Mahiro!"),
    allowUseUsernameLogin: new BooleanValidator(false)
}

export const createConfig = () => {
    return create<Config>(configSchema)
}

export const verifyConfig = (config: any) => {
    return verify(config, configSchema)
}

export const commitHash = import.meta.env.commitHash

export const config = createConfig()