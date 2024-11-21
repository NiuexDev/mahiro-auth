import { readFile, writeFile, mkdir } from "node:fs/promises"
import YAML from "yaml"
import { createLogger, format, transports } from "winston"
import deepcopy from "deepcopy"
import crypto from "crypto"
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

export type ConfigType = {
    server: {
        host: string
        port: number
        corsOrigins: string[]
        apiBaseUrl: string
        logDir: string
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
        encryption: string
        fromAddress: string
        fromName: string
    }
    secret: {
        jwt: string
        yggdrasil: {
            privateKey: string
            publicKey: string
        }
    }
}

crypto.generateKeyPairSync("rsa", {modulusLength: 4096,publicKeyEncoding: {type: "spki",format: "pem"},privateKeyEncoding: {type: "pkcs8",format: "pem"}})

const defaultConfig: ConfigType = {
    server: {
        host: "127.0.0.1",
        port: 10721,
        corsOrigins: [],
        apiBaseUrl: "/yggdrasil",
        logDir: "log",
        
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
        encryption: "ssl",
        fromAddress: "",
        fromName: ""
    },
    secret: {
        jwt: crypto.randomBytes(32).toString("hex"),
        yggdrasil: crypto.generateKeyPairSync("rsa", {modulusLength: 4096,publicKeyEncoding: {type: "spki",format: "pem"},privateKeyEncoding: {type: "pkcs8",format: "pem"}})
    }
}

let config: ConfigType

const configPath = "config.yml"

function verifyConfig(config: any) {
    if (!isObjectNotEmpty(config)) throw new ConfigError("格式错误。")

    if (!isObjectNotEmpty(config.server)) throw ConfigErrorByMissingOrInvalid("server") 
    {
        if (typeof config.server.host !== "string"/* 待改为判断是否是合法host */) throw ConfigErrorWithReason("server.host", "不是合法的主机。")
        if (!isValidPort(config.server.port)) throw ConfigErrorWithReason("server.port", "不是合法的端口。")
        if (typeof config.server.corsOrigins !== 'object' || !Array.isArray(config.server.corsOrigins) || config.server.corsOrigins.every((item: any) => typeof item !== "string")) ConfigErrorWithReason("server.corsOrigins", "缺失或不为string[]。")
        if (typeof config.server.apiBaseUrl !== "string") throw ConfigErrorByMissingOrInvalid("server.apiBaseUrl")
        if (typeof config.server.logDir !== "string") throw ConfigErrorByMissingOrInvalid("server.logDir")
        
    }

    if (!isObjectNotEmpty(config.database)) throw ConfigErrorByMissingOrInvalid("database")
    {
        if (config.database.type === "sqlite") {
            if (!isObjectNotEmpty(config.database.sqlite)) throw ConfigErrorByMissingOrInvalid("database.sqlite")
            if (typeof config.database.sqlite.file !== "string") throw ConfigErrorByMissingOrInvalid("database.sqlite.file")
        } else if (config.database.type === "mysql") {
            if (!isObjectNotEmpty(config.database.mysql)) throw ConfigErrorByMissingOrInvalid("database.mysql")
            if (typeof config.database.mysql.host !== "string"/* 待改为判断是否是合法host */) throw ConfigErrorWithReason("database.mysql.host", "不是合法的主机。")
            if (!isValidPort(config.database.mysql.port)) throw ConfigErrorWithReason("database.mysql.port", "不是合法的端口。")
            if (typeof config.database.mysql.user !== "string") throw ConfigErrorByMissingOrInvalid("database.mysql.user")
            if (typeof config.database.mysql.database !== "string") throw ConfigErrorByMissingOrInvalid("database.mysql.database")
        } else {
            throw ConfigErrorWithReason("database.type", "缺失或不为\"sqlite\"或\"mysql\"之一。")
        }
    }

    if (!isObjectNotEmpty(config.email)) throw ConfigErrorByMissingOrInvalid("email")
    {
        if (typeof config.email.host !== "string"/* 待改为判断是否是合法host */) throw ConfigErrorWithReason("email.host", "不是合法的主机。")
        if (!isValidPort(config.email.port)) throw ConfigErrorWithReason("email.port", "不是合法的端口。")
        if (typeof config.email.username !== "string") throw ConfigErrorByMissingOrInvalid("email.username")
        if (typeof config.email.password !== "string") throw ConfigErrorByMissingOrInvalid("email.password")
        if (typeof config.email.encryption !== "string") throw ConfigErrorByMissingOrInvalid("email.encryption")
        if (typeof config.email.fromAddress !== "string") throw ConfigErrorByMissingOrInvalid("email.fromAddress")
        if (typeof config.email.fromName !== "string") throw ConfigErrorByMissingOrInvalid("email.fromName")
    }
}

function isObjectNotEmpty(obj: any) {
    return typeof obj === "object" && obj !== null
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

function ConfigErrorByMissingOrInvalid(path: string) {
    return ConfigErrorWithReason(path, "缺失或格式错误。")
}

function ConfigErrorWithReason(path: string, reason: string) {
    return new ConfigError(`配置项[${path}]${reason}`)
}

export async function loadConfig(): Promise<void> {
    logger.info("加载配置文件中。")
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
            throw e
        }   
    }
    try {
        const configFile = await readFile(configPath, "utf-8")
        try {
            const tempConfig = YAML.parse(configFile)
            verifyConfig(tempConfig)
            config = tempConfig
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
                config = defaultConfig
                writeFile(configPath, YAML.stringify(config))
            } catch (e) {
                logger.error("写入配置文件失败。")
                throw e
            }
        } else {
            throw e
        }
    }
    return
}

export function useConfig(): ConfigType {
    return config
}

export function useConfigCopy(): ConfigType {
    return deepcopy(config)
}