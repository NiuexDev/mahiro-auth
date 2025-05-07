import { ArrayValidator, BooleanValidator, create, StringValidator, ValueValidator, verify } from "~/util/schema"

export type Config = {
    apiUrl: string,
    meta: {
        icon: string, // 处理后导出为 iconUrl
        title: string,
        description: string,
    }
    assets: {
        logo: string,
        background: string[], //  处理后导出为 backgroundUrl
    }
    // language: Record<"zh-cn" | "en", any>
}

const configSchema = {
    apiUrl: new StringValidator(import.meta.env.MODE === "development" ? "http://localhost:10721" : "/api"),
    meta: {
        icon: new StringValidator("assets/icon.png"),
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
                return ["assets/background.png"]
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

export const assetsConfigItem = [
    "meta.icon",
    "assets.logo",
    "assets.background",
]

/**
 * 应用会使用的配置
 */
export const commitHash = import.meta.env.commitHash ?? "development"
export const shortCommitHash = import.meta.env.commitHash?.slice(0, 7) ?? "development"
export const config = createConfig()