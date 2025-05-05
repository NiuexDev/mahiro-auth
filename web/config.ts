import { ArrayValidator, BooleanValidator, create, StringValidator, ValueValidator, verify } from "~/util/schema"

const isDevelopment = !!(
    typeof import.meta !== "undefined" && 
    import.meta.env && 
    (import.meta.env.DEV || import.meta.env.PROD)
)

export type Config = {
    apiUrl: string,
    meta: {
        icon: string, // 处理后导出为 iconUrl
        title: string,
        description: string,
    }
    assets: {
        logo: string,
        background: string[] | string, //  处理后导出为 backgroundUrl
    }
    // language: Record<"zh-cn" | "en", any>
}



const configSchema = {
    apiUrl: new StringValidator(isDevelopment ? "http://localhost:10721" : "/api"),
    meta: {
        icon: new StringValidator("assets/favicon.ico"),
        title: new StringValidator("Mahiro  验证"),
        description: new StringValidator("Moe Mahiro!"),
    },
    assets: {
        logo: new StringValidator("assets/logo.png"),
        background: new  class extends ValueValidator {
            private value: any;
            private error: string;
            constructor(value: any[] = [], error: string = "须为文件路径数组") {
                super()
                this.value = value
                this.error = error
            }
            create() {
                return []
            }
            verify(value: any) {
                if (Array.isArray(value) === false) return this.error
                if (value.every(item => typeof item === "string") === false) return this.error
            }
        }
    }
}

export const createConfig = () => {
    return create<Config>(configSchema)
}

export const verifyConfig = (config: any) => {
    return verify(config, configSchema)
}

// 
// 应用会使用的配置
// 
export const commitHash = import.meta.env.commitHash ?? "development"
export const shortCommitHash = import.meta.env.commitHash?.slice(0, 7) ?? "development"
export const config = createConfig()
export const iconUrl = ""
export const backgroundUrl = []