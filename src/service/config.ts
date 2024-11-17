import { log, error } from "node:console"
import { readFile, writeFile } from "node:fs/promises"
import * as YAML from "yaml"
import deepcopy from "deepcopy"

export type ConfigType = {
    server: {
        host: string
        port: number
    }
    databese: {
        type: "sqlite"|"mysql"
        sqlite?: {
            file: string
        }
        mysql?: {
            host: string
            port: number
            user: string
            password: string
            database: string
        }
    }
}

let config: ConfigType = {
    server: {
        host: "127.0.0.1",
        port: 10721
    },
    databese: {
        type: "sqlite",
        sqlite: {
            file: "database.db"
        }
    }
}

const configPath = "./config.yml"

function verifyConfig(config: any) {
    if (!isObjectNotEmpty(config)) throw new ConfigError("格式错误。")

    if (!isObjectNotEmpty(config.server)) throw ConfigErrorByMissingOrInvalid("server") 
    {
        if (typeof config.server.host !== "string"/* 待改为判断是否是合法host */) throw ConfigErrorWithReason("server.host", "不合法的主机。")
        if (!isValidPort(config.server.port)) throw ConfigErrorWithReason("server.port", "不合法的端口。")
    }

    if (!isObjectNotEmpty(config.databese)) throw ConfigErrorByMissingOrInvalid("database")
    {
        if (config.databese.type === "sqlite") {
            if (!isObjectNotEmpty(config.databese.sqlite)) throw ConfigErrorByMissingOrInvalid("database.sqlite")
            if (typeof config.databese.sqlite.file !== "string") throw ConfigErrorByMissingOrInvalid("database.sqlite.file")
        } else if (config.databese.type === "mysql") {
            if (!isObjectNotEmpty(config.databese.mysql)) throw ConfigErrorByMissingOrInvalid("database.mysql")
            if (typeof config.databese.mysql.host !== "string"/* 待改为判断是否是合法host */) throw ConfigErrorWithReason("database.mysql.host", "不合法的主机。")
            if (!isValidPort(config.databese.mysql.port)) throw ConfigErrorWithReason("database.mysql.port", "不合法的端口。")
            if (typeof config.databese.mysql.user !== "string") throw ConfigErrorByMissingOrInvalid("database.mysql.user")
            if (typeof config.databese.mysql.database !== "string") throw ConfigErrorByMissingOrInvalid("database.mysql.database")
        } else {
            throw ConfigErrorWithReason("database.type", "缺失或不为\"sqlite\"或\"mysql\"之一。")
        }
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
    log("正在加载配置文件。")
    try {
        const configFile = await readFile(configPath, "utf-8")
        try {
            const tempConfig = YAML.parse(configFile)
            verifyConfig(tempConfig)
            config = tempConfig
            log("配置文件加载完毕。") 
        } catch (e: any) {
            if (e.name === "YAMLParseError" || e.name === "ConfigError") {
                error(`${e.name}: ${e.message}`)
                process.exit(1)
            }
            throw e
        }
    } catch (e: any) {
        if (e.message === "No such file or directory") {
            log("配置文件不存在，正在创建默认配置文件。")
            try {
                writeFile(configPath, YAML.stringify(config))
            } catch (e) {
                error("写入配置文件失败。")
                throw e
            }
        } else {
            throw e
        }
    }
    return
}

export function getConfig(): ConfigType {
    return deepcopy(config)
}