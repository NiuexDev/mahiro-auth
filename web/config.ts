import { ArrayValidator, BooleanValidator, create, StringValidator, ValueValidator, verify } from "~/util/schema"

class StringAbleNullValidator extends ValueValidator {
    private value: any;
    private error: string;
    constructor(value: any = null, error: string = "须为 null 或字符串") {
        super()
        this.value = value
        this.error = error
    }
    create() {
        return this.value
    }
    verify(value: any) {
        if (!(value === null || typeof value === "string")) return this.error
    }
}

export type Config = {
    apiUrl: string,
    meta: {
        icon: string, // 处理后导出为 iconUrl
        title: string,
        description: string,
    }
    assets: {
        public: string,
        logo: string,
        background: string[], //  处理后导出为 backgroundUrl
    },
    ui: {
        bgColor: {
            light: string,
            dark: string,
        },
        home: {
            html: string | null
            title: string,
            description: string,
            blur: boolean,

            footer: {
                copyright: string,
                link: {
                    name: string,
                    url: string,
                }[],
                showpowered: boolean
            },
        },
    }
    // language: Record<"zh-cn" | "en", any>
}

const isDev = import.meta.env.MODE === "development"

const configSchema = {
    apiUrl: new StringValidator(isDev ? "http://localhost:10721" : "/api"),
    meta: {
        icon: new StringValidator("assets/icon.png"),
        title: new StringValidator("Mahiro  验证"),
        description: new StringValidator("Moe Mahiro!"),
    },
    assets: {
        public: new StringValidator("public/"),
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
        },
    },
    ui: {
        bgColor: {
            light: new StringValidator("rgba(0, 0, 0, 0)"),
            dark: new StringValidator("rgba(0, 0, 0, 0)"),
        },
        home: {
            html: new StringAbleNullValidator(null),
            title: new StringValidator("Mahiro  验证"),
            description: new StringValidator("Moe Mahiro!"),
            blur: new class extends ValueValidator {
                private error: string;
                private value:  boolean | number;
                constructor(value = true, error: string = "须为布尔值或数字") {
                    super()
                    this.value = value
                    this.error = error
                }
                create() {
                    return this.value
                }
                verify(value: any) {
                    if (typeof value !== "boolean" && typeof value !== "number") return this.error
                }
            },
            footer: {
                link: new class extends ValueValidator {
                    private value: any;
                    private error: string;
                    constructor(value: any = [], error: string = "须为数组") {
                        super()
                        this.value = value
                        this.error = error
                    }
                    create() {
                        return [
                            {
                                name: "Github",
                                url: "https://github.com/NiuexDev/mahiro-auth",
                            },
                        ]
                    }
                    verify(value: any) {
                        if (Array.isArray(value) === false) return this.error
                        if (value.every(item => typeof item === "object") === false) return this.error
                        if (value.every(item => typeof item.name === "string" && typeof item.url === "string") === false) return this.error
                    }
                },
                copyright: new StringValidator("© 2025 Niuex Dev / Mahiro Auth"),
                showpowered: new BooleanValidator(true),
            }
        },
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