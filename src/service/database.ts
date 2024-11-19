import { createConnection } from "mysql2/promise"
import { Database as Sqlite } from "bun:sqlite"
import { useConfig, type ConfigType } from "./config"

let config: ConfigType
let sqlite
let mysql

const dbTable = {
    mysql: {
        user:
            `id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            uuid CHAR(32) NOT NULL,
            name VARCHAR(255),
            skin VARCHAR(255),
            cape VARCHAR(255)`,
    },
    sqlite: {
        user:
            `id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            uuid TEXT NOT NULL,
            name TEXT,
            skin TEXT,
            cape TEXT`,
    }
}

export async function initDatabase() {
    config = useConfig()
    sqlite = config.database.type === "sqlite" ? new Sqlite(config.database.sqlite.file) : null
    mysql = config.database.type === "mysql" ?
        await createConnection({
            ...config.database.mysql,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        }) : null

    if (config.database.type === 'sqlite') {
        for (const [name, columns] of Object.entries(dbTable.sqlite)) {
            sqlite!.exec(`CREATE TABLE IF NOT EXISTS ${name} (${columns})`)
        }
    }
    if (config.database.type === 'mysql') {
        for (const [name, columns] of Object.entries(dbTable.mysql)) {
            await mysql!.execute(`CREATE TABLE IF NOT EXISTS ${name} (${columns})`)
        }
    }
}

sqlite?.query("SELECT 1")

export async function query(sql: string, params?: any[]): Promise<any[]> {
    if (config.database.type === 'sqlite') {
        const sqlite = new Sqlite(config.database.sqlite.file)
        return sqlite.query(sql, params)
    }
    if (config.database.type === 'mysql') {
        const mysqlPool = createPool({
            ...config.database.mysql,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        })
        const mysql = await mysqlPool.getConnection()
        return mysql.execute(sql, params)
    }
}