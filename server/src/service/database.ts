import { connect, Schema, type Model } from "mongoose"
import { useConfig } from "@/service/config"
import { getLogger } from "@/service/logger"
import { tryCatch } from "~/util/try-catch"

export async function initDatabase() {
    let { database } = await useConfig()
    let logger = getLogger("database")
    const { data: mongoose, error } = await tryCatch(
        connect(`mongodb://${database.host}:${database.port}/`, {
            user: database.user,
            pass: database.password,
            dbName: database.database
        })
    )
    if (error) {
        logger.error(`数据库连接失败`)
        throw error
    }
    logger.info("数据库已连接")
}