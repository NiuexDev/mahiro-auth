import { readFile, writeFile, mkdir, access, constants } from "node:fs/promises"
import YAML from "yaml"
import crypto from "crypto"
import { getLogger } from "@/service/logger"
import * as schema from "~/util/schema"
import { BooleanValidator, StringValidator, ValueValidator } from "~/util/schema"
import { Logger } from "winston"
import { useBaseUrl } from "~/util/useBaseUrl"
import { getArgv } from "./cmd"


export const dataPath = (() => {
    let path = getArgv("data-dir") ?? "data"
    path = path.replace(/[/\\]+$/, "")
    path = path.replace(/^[/\\]+/, "")
    if (path.includes("\\") || path.includes("/") || path === "..") {
        console.error("数据目录不可为多层目录：" + path)
        process.exit(1)
    }
    if (path === "") {
        path = "."
    }
    return path
})()

export const useDataPath = (path: string) => {
    return useBaseUrl(dataPath, path)
}


let logger: Logger

export interface Config {
    server: {
        host: string
        port: number
        cors: boolean | string[]
        yggdrasilApiUrl: string
        log: {
            logRequest: boolean
        }
    }
    database: {
        host: string
        port: number
        user: string
        password: string
        database: string
    }
    email: {
        host: string
        port: number
        username: string
        password: string
        secure: boolean
        fromAddress: string
        fromName: string

        template: {
            enable: boolean
            default: string
            register: string
            login: string
            resetpasswd: string
        }
    }
    secret: {
        jwt: string
        yggdrasil: {
            privateKey: string
            publicKey: string
        }
    }
}

let config: Config
const configPath = useDataPath("config.yml")

class HostValidator extends ValueValidator {
    create() {
        return "127.0.0.1"
    }
    verify(value: any): void | string {

        if (typeof value === "string") {
            const ip = value.split(".")
            const isIp = ip.every(octet => {
                const octetNumber = new Number(octet).valueOf()
                if (Number.isNaN(octetNumber)) return false
                if (octetNumber < 0 || octetNumber > 255) return false
                return true
            })
            if (isIp) return
        }
        return "须为合法的IP地址"
    }
}

class PortValidator extends ValueValidator {
    private value: number;
    constructor(value: number) {
        super()
        this.value = value
    }
    create() {
        return this.value
    }
    verify(value: any): void | string {
        if (
            typeof value === "number" &&
            value%1 === 0 &&
            value >= 0 &&
            value <= 65535
        ) {
            return
        }
        return "须为合法的端口"
    }
}

const configSchema = {
    server: {
        host: new HostValidator(),
        port: new PortValidator(10721),
        cors: new class extends ValueValidator {
            create() {
                return false
            }
            verify(value: any): void | string {
                if (value === false || value === true) return
                if (Array.isArray(value)) {
                    if (value.every(item => typeof item === "string")) return
                }
                return "不是合法的CORS来源，须为正确的来源数组或true/false"
            }
        },
        yggdrasilApiUrl: new StringValidator("/yggdrasil", "不是合法的URL，须为字符串"),
        log: {
            logRequest: new BooleanValidator(false, "须为布尔值"),
        },
    },
    database: {
        host: new StringValidator("127.0.0.1", "不是合法的数据库主机，须为字符串"),
        port: new PortValidator(27017),
        user: new StringValidator("root", "不是合法的数据库用户名，须为字符串"),
        password: new StringValidator("root", "不是合法的数据库密码，须为字符串"),
        database: new StringValidator("mahiro-auth", "不是合法的数据库名，须为字符串"),
    },
    email: {
        host: new StringValidator("example.email.com", "不是合法的邮件主机，须为字符串"),
        port: new PortValidator(465),
        username: new StringValidator("username", "不是合法的邮件用户名，须为字符串"),
        password: new StringValidator("password", "不是合法的邮件密码，须为字符串"),
        secure: new BooleanValidator(true, "须为布尔值"),
        fromAddress: new StringValidator("username@example.email.com", "不是合法的邮件地址，须为字符串"),
        fromName: new StringValidator("username", "不是合法的邮件昵称，须为字符串"),

        template: {
            enable: new BooleanValidator(false, "须为布尔值"),
            default: new StringValidator("", "应为一个路径"),
            register: new StringValidator("", "应为一个路径"),
            login: new StringValidator("", "应为一个路径"),
            resetpasswd: new StringValidator("", "应为一个路径"),
        },
    },
    secret: {
        jwt: new StringValidator(
            crypto.randomBytes(32).toString("hex"),
            "不是合法的JWT密钥，须为较长的字符串"
        ),
        yggdrasil: new class extends ValueValidator {
            create() {
                return crypto.generateKeyPairSync(
                    "rsa",
                    {
                        modulusLength: 4096,
                        publicKeyEncoding: {
                            type: "spki",
                            format: "pem"
                        },
                        privateKeyEncoding: {
                            type: "pkcs8",
                            format: "pem"
                        }
                    }
                )
            }
            verify(value: any): void | string {
                if (
                    typeof value !== "object" ||
                    !value.hasOwnProperty('publicKey') ||
                    !value.hasOwnProperty('privateKey'
                )
                ) {
                    return "不是合法的密钥对，须为包含\"publicKey\"和\"privateKey\"的对象"
                }
                const pubKey = value.publicKey
                const privKey = value.privateKey
                if (
                    typeof pubKey !== 'string' ||
                    typeof privKey !== 'string' ||
                    !pubKey.startsWith('-----BEGIN PUBLIC KEY-----') ||
                    !privKey.startsWith('-----BEGIN PRIVATE KEY-----') ||
                    !pubKey.endsWith('-----END PUBLIC KEY-----\n') ||
                    !privKey.endsWith('-----END PRIVATE KEY-----\n')
                ) {
                    return "\"publicKey\"和\"privateKey\"须为合法的公钥和私钥"
                }
            }
        }
    }
}


export const initConfig = async (): Promise<void> => {
    logger = getLogger("config")
    try {
        await access(configPath, constants.F_OK | constants.R_OK | constants.W_OK)
        const configFile = await readFile(configPath, "utf-8")
        const resolvedConfig = YAML.parse(configFile)
        if (resolvedConfig === undefined || resolvedConfig === null) throw new Error()
    } catch (e: any) {
        logger.info("配置文件不存在，正在创建默认配置文件")
        try {
            const defaultConfig = schema.create<Config>(configSchema)
            await writeFile(configPath, YAML.stringify(defaultConfig))
            logger.info("创建完成，请检查配置文件")
            process.exit(0)
        } catch (e: any) {
            logger.error("写入配置文件失败")
            throw e
        }
    }
    logger.info("加载配置文件中")
    const configFile = await readFile(configPath, "utf-8")
    const resolvedConfig = YAML.parse(configFile)
    const afterConfig = JSON.stringify(resolvedConfig)
    const resultList = schema.fix(resolvedConfig, configSchema)
    const beforeConfig = JSON.stringify(resolvedConfig)
    let exit = 0
    if (resultList !== true && resultList.length !== 0) {
        exit = 2
        resultList.map(result => 
           logger.error(`配置项：\`${result.path}\` ${result.reason}，当前值：${JSON.stringify(result.value)}`)
        )
    }
    if (afterConfig !== beforeConfig) {
        if (exit === 0) exit = 1
        logger.info("配置文件不完整，已补全，请检查配置文件")
        try {
            await writeFile(configPath, YAML.stringify(resolvedConfig))
        } catch (e: any) {
            logger.error("写入配置文件失败")
            throw e
        }
    }
    if (exit === 1) process.exit(0)
    if (exit === 2) process.exit(1)
    config = resolvedConfig
    logger.info("配置文件已加载") 
    return
}

export const useConfig = async (): Promise<Config> => {
    if (config === undefined) await initConfig()
    return config
}