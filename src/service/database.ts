import { createConnection, type Connection } from "mysql2/promise"
import { Database as Sqlite } from "bun:sqlite"
import { useConfig, type ConfigType } from "@/service/config"
import { log } from "console"
import { mysqlTable, sqliteTable } from "@/model/user"

class DatabaseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "DatabaseError"
    }
}

let config: ConfigType
let sqlite: Sqlite
let mysql: Connection

const dbTable = {
    user: {
        mysql: mysqlTable,
        sqlite: sqliteTable,
    }
}

export async function initDatabase() {
    config = useConfig()
    if (config.database.type === "sqlite") sqlite = new Sqlite(config.database.sqlite.file)
    if (config.database.type === "mysql") mysql = await createConnection({
        ...config.database.mysql,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    })

    if (config.database.type === 'sqlite') {
        for (const [name, table] of Object.entries(dbTable)) {
            sqlite.exec(`CREATE TABLE IF NOT EXISTS ${name} (${table.sqlite})`)
        }
    }
    if (config.database.type === 'mysql') {
        for (const [name, table] of Object.entries(dbTable)) {
            await mysql.execute(`CREATE TABLE IF NOT EXISTS ${name} (${table.mysql})`)
        }
    }
}

interface InsertResult {
    lastID: number
}


interface InsertManyResult {
    lastID: number
    changes: number
}

export async function insert(table: string, data: Record<any, any>): Promise<InsertResult> {
    const columns = Object.keys(data).join(",")
    const values = Object.values(data)
    const placeholders = values.map(() => '?').join(",")

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
    
    if (config.database.type === 'sqlite') {
        const result = sqlite.exec(sql, values)
        return {
            //@ts-ignore
            lastID: result.lastInsertRowid
        }
    }
    if (config.database.type === 'mysql') {
        const result = await mysql.execute(sql, values)
        return {
            //@ts-ignore
            lastID: result[0].insertId-1+result[0].affectedRows
        }
    }
    throw new Error()
}
export async function insertMany(table: string, key: string[], value: any[][]): Promise<InsertManyResult> {
    value.forEach((value, rowIndex) => {
        if (value.length !== key.length) 
            throw new DatabaseError(`插入数据与列不对应。第${rowIndex}个数据：${key.map((key, valueIndex)=>`${key}: ${JSON.stringify(value[valueIndex])||"<此处缺失>"}`).join(", ")}`)
    })
    const columns = key.join(",")
    const data = value.flat()
    const placeholders = value.map((value) => "("+value.map(() => "?").join()+")").join(",")

    const sql = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}`

    if (config.database.type === 'sqlite') {
        const result = sqlite.exec(sql, data)
        return {
            //@ts-ignore
            lastID: result.lastInsertRowid,
            changes: result.changes
        }
    }
    if (config.database.type === 'mysql') {
        const result = await mysql.execute(sql, data)
        return {
            //@ts-ignore
            lastID: result[0].insertId-1+result[0].affectedRows,
            //@ts-ignore
            changes: result[0].affectedRows
        }
    }
    throw new Error()
}

export async function query(table: string, column: string[]|"*"): Promise<any>;
export async function query(table: string, column: string[]|"*", where: string, whereParam: any[]): Promise<any>;
export async function query(table: string, column: string[]|"*", where?: string, whereParam?: any[]): Promise<any> {

    if (config.database.type === 'sqlite') {
        let index = 1
        const sql = `SELECT ${column === "*" ? "*" : column.join(",")} FROM ${table} ${where ? `WHERE ${where.replace(/\?/g, ()=>{return "?"+index++})}` : ""}`
        log(sql)
        const result = sqlite.query(sql)
        if (whereParam === undefined) {
            return result.all()
        } else {
            return result.all(...whereParam)
        }
    }

    if (config.database.type === 'mysql') {
        const sql = `SELECT ${column === "*" ? "*" : column.join(",")} FROM ${table} ${where ? `WHERE ${where}` : ""}`
        log(sql)
        if (whereParam === undefined) {
            const rows = await mysql.execute(sql)
            return rows[0]
        } else {
            const rows = await mysql.execute(sql, whereParam)
            return rows[0]
        }
    }
    throw new Error()
}