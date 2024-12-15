import { readFile, writeFile, mkdir } from "node:fs/promises"
import YAML from "yaml"
import { createLogger, format, transports } from "winston"
import deepcopy from "deepcopy"
import crypto from "crypto"
import { mergeObject } from "@/util/object"
import { log } from "node:console"
const { combine, timestamp, label, printf, colorize } = format

const logger = createLogger({
    level: "info",
    format: combine(
        label({ label: "config" }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp, label }) => {
            return `${timestamp} [${level}] [${label}]: ${message}`
        }),
    ),
    transports: [
        new transports.Console({
            consoleWarnLevels: ["warn"],
            stderrLevels: ["error"],
            format: combine(
                colorize({ all: true }),
            )
        })
    ]
})

export interface Config {
    server: {
        host: string
        port: number
        corsOrigins: string[]
        apiBaseUrl: string
        log: {
            dir: string
            logRequest: boolean
        }
    }
    database: {
        type: "sqlite"|"mysql"
        sqlite: {
            file: string
        }
        mysql: {
            host: string
            port: number
            user: string
            password: string
            database: string
        }
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

const defaultConfig: Config = {
    server: {
        host: "127.0.0.1",
        port: 10721,
        corsOrigins: [],
        apiBaseUrl: "/yggdrasil",
        log: {
            dir: "log",
            logRequest: false
        },
        
    },
    database: {
        type: "sqlite",
        sqlite: {
            file: "database.sqlite"
        },
        mysql: {
            host: "127.0.0.1",
            port: 3306,
            user: "",
            password: "",
            database: ""
        }
    },
    email: {
        host: "example.email.com",
        port: 465,
        username: "",
        password: "",
        secure: true,
        fromAddress: "",
        fromName: "",

        template: {
            enable: false,
            default: "",
            register: "",
            login: "",
            resetpasswd: ""
        },
    },
    secret: {
        jwt: crypto.randomBytes(32).toString("hex"),
        yggdrasil: crypto.generateKeyPairSync("rsa", {modulusLength: 4096,publicKeyEncoding: {type: "spki",format: "pem"},privateKeyEncoding: {type: "pkcs8",format: "pem"}})
    }
}

let config: Config
const configPath = "config.yml"

async function fixConfig(config: any) {
    if (config === null) {
        logger.info("配置文件不完整，正在从默认配置文件补全。")
        try {
            await writeFile(configPath, YAML.stringify(defaultConfig))
            logger.info("补全完成，请检查配置文件。")
            process.exit(0)
        } catch (e: any) {
            logger.error("补全配置文件失败。")
            logger.error(`${e.name}: ${e.message}`)
        }
    }
    const {object: mergedConfig, modified} = mergeObject(config, defaultConfig)
    if (modified) {
        logger.info("配置文件不完整，正在从默认配置文件补全。")
        try {
            await writeFile(configPath, YAML.stringify(mergedConfig))
            logger.info("补全完成，请检查配置文件。")
            process.exit(0)
        } catch (e: any) {
            logger.error("补全配置文件失败。")
            logger.error(`${e.name}: ${e.message}`)
        }
    }
}

function verifyConfig(config: Config) {
    /**
     * server
     */
    if (typeof config.server.host !== "string"/* 待改为判断是否是合法host */) throw ConfigErrorWithReason("server.host", config.server.host, "不是合法的主机。")
    if (!isValidPort(config.server.port)) throw ConfigErrorWithReason("server.port", config.server.port, "不是合法的端口。")
    if (typeof config.server.corsOrigins !== 'object' || !Array.isArray(config.server.corsOrigins) || config.server.corsOrigins.every((item: any) => typeof item !== "string")) ConfigErrorWithReason("server.corsOrigins", config.server.corsOrigins, "缺失或不为string[]。")
    if (typeof config.server.apiBaseUrl !== "string") throw ConfigErrorByMissingOrInvalid("server.apiBaseUrl", config.server.apiBaseUrl)
    if (typeof config.server.log.dir !== "string") throw ConfigErrorByMissingOrInvalid("server.logDir", config.server.log.dir)
    if (typeof config.server.log.logRequest !== "boolean") throw ConfigErrorByMissingOrInvalid("server.logDir", config.server.log.logRequest)

    /**
     * database
     */
    if (config.database.type === "sqlite") {
        if (typeof config.database.sqlite.file !== "string") throw ConfigErrorByMissingOrInvalid("database.sqlite.file", config.database.sqlite.file)
    } else if (config.database.type === "mysql") {
        if (typeof config.database.mysql.host !== "string"/* 待改为判断是否是合法host */) throw ConfigErrorWithReason("database.mysql.host", config.database.mysql.host, "不是合法的主机。")
        if (!isValidPort(config.database.mysql.port)) throw ConfigErrorWithReason("database.mysql.port", config.database.mysql.port, "不是合法的端口。")
        if (typeof config.database.mysql.user !== "string") throw ConfigErrorByMissingOrInvalid("database.mysql.user", config.database.mysql.user)
        if (typeof config.database.mysql.database !== "string") throw ConfigErrorByMissingOrInvalid("database.mysql.database", config.database.mysql.database)
    } else {
        throw new ConfigError("配置项[database.type]不为\"sqlite\"或\"mysql\"之一。")
    }

    /**
     * email
     */
    if (typeof config.email.host !== "string"/* 待改为判断是否是合法host */) throw ConfigErrorWithReason("email.host", config.email.host, "不是合法的主机。")
    if (!isValidPort(config.email.port)) throw ConfigErrorWithReason("email.port", config.email.port, "不是合法的端口。")
    if (typeof config.email.username !== "string") throw ConfigErrorByMissingOrInvalid("email.username", config.email.username)
    if (typeof config.email.password !== "string") throw ConfigErrorByMissingOrInvalid("email.password", config.email.password)
    if (typeof config.email.secure !== "boolean") throw ConfigErrorByMissingOrInvalid("email.encryption", config.email.secure)
    if (typeof config.email.fromAddress !== "string") throw ConfigErrorByMissingOrInvalid("email.fromAddress", config.email.fromAddress)
    if (typeof config.email.fromName !== "string") throw ConfigErrorByMissingOrInvalid("email.fromName", config.email.fromName)

    if (typeof config.email.template.enable !== "boolean") throw ConfigErrorByMissingOrInvalid("emailTemplate.enable", config.email.template.enable)
    if (typeof config.email.template.default !== "string") throw ConfigErrorByMissingOrInvalid("emailTemplate.default", config.email.template.default)
    if (typeof config.email.template.register !== "string") throw ConfigErrorByMissingOrInvalid("emailTemplate.register", config.email.template.register)
    if (typeof config.email.template.login !== "string") throw ConfigErrorByMissingOrInvalid("emailTemplate.login", config.email.template.login)
    if (typeof config.email.template.resetpasswd !== "string") throw ConfigErrorByMissingOrInvalid("emailTemplate.resetpasswd", config.email.template.resetpasswd)

    /**
     * secret
     */
    if (typeof config.secret.jwt !== "string") throw ConfigErrorByMissingOrInvalid("secret.jwt", config.secret.jwt)
    if (typeof config.secret.yggdrasil.privateKey !== "string") throw ConfigErrorByMissingOrInvalid("secret.yggdrasil.privateKey", config.secret.yggdrasil.privateKey)
    if (typeof config.secret.yggdrasil.publicKey !== "string") throw ConfigErrorByMissingOrInvalid("secret.yggdrasil.privateKey", config.secret.yggdrasil.publicKey)
}

function isValidPort(value: any) {
    return (
        typeof value === "number" &&
        value%1 === 0 &&
        value >= 0 &&
        value <= 65535
    )
}

class ConfigError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "ConfigError"
    }
}

function ConfigErrorByMissingOrInvalid(path: string, value: any) {
    return ConfigErrorWithReason(path, value, "格式错误。")
}

function ConfigErrorWithReason(path: string, value: any, reason: string) {
    return new ConfigError(`配置项([${path}]: ${JSON.stringify(value)})${reason}`)
}

export async function loadConfig(): Promise<void> {
    try {
        process.chdir("data")
    } catch (e: any) {
        if (e.message === "No such file or directory") {
            try {
                await mkdir("data")
                process.chdir("data")
            } catch (e) {
                logger.error("创建数据目录失败或无法读写数据目录。")
                throw e
            }
        } else {
            logger.error("无法读写数据目录。")
            logger.error(`${e.name}: ${e.message}`)
        }   
    }
    logger.info("加载配置文件中。")
    try {
        const configFile = await readFile(configPath, "utf-8")
        try {
            const resolvedConfig = YAML.parse(configFile)
            await fixConfig(resolvedConfig)
            verifyConfig(resolvedConfig)
            config = resolvedConfig
            logger.info("配置文件已加载。") 
        } catch (e: any) {
            if (e.name === "YAMLParseError" || e.name === "ConfigError") {
                logger.error(`${e.name}: ${e.message}`)
                process.exit(1)
            }
            throw e
        }
    } catch (e: any) {
        if (e.message === "No such file or directory") {
            logger.info("配置文件不存在，正在创建默认配置文件。")
            try {
                await writeFile(configPath, YAML.stringify(defaultConfig))
                logger.info("创建完成，请检查配置文件。")
                process.exit(0)
            } catch (e: any) {
                logger.error("写入配置文件失败。")
                logger.error(`${e.name}: ${e.message}`)
            }
        } else {
            throw e
        }
    }
    return
}

export async function useConfig(): Promise<Config> {
    if (config === undefined) await loadConfig()
    return config
}

export async function useConfigCopy(): Promise<Config> {
    return deepcopy(await useConfig())
}