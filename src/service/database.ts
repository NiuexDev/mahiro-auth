import { createConnection, type Connection } from "mysql2/promise"
import { Database as Sqlite } from "bun:sqlite"
import { useConfig, type Config } from "@/service/config"
import User from "@/model/user"
import Code from "@/model/code"
import { getLogger } from "./logger"
import type { Logger } from "winston"

class DatabaseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "DatabaseError"
    }
}

let config = await useConfig()
let logger = getLogger("database")

let sqlite: Sqlite
let mysql: Connection

export async function initDatabase() {
    const dbTable = {
        mysql: {
            user: User.mysqlTable,
            code: Code.mysqlTable,
        },
        sqlite: {
            user: User.sqliteTable,
            code: Code.sqliteTable,
        }
    }
    try {
        if (config.database.type === "sqlite") sqlite = new Sqlite(config.database.sqlite.file)
        if (config.database.type === "mysql") mysql = await createConnection({
            ...config.database.mysql,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        })
    } catch (e: any) {
        logger.error("无法连接至数据库。")
        logger.error(e.message)
        process.exit(1)
    }
    logger.info("数据库已连接。")

    if (config.database.type === 'sqlite') {
        for (const [name, columns] of Object.entries(dbTable.sqlite)) {
            sqlite.exec(`CREATE TABLE IF NOT EXISTS ${name} (${columns})`)
        }
    }
    if (config.database.type === 'mysql') {
        for (const [name, columns] of Object.entries(dbTable)) {
            await mysql.execute(`CREATE TABLE IF NOT EXISTS ${name} (${columns})`)
        }
    }
}

interface Result {
    lastID: number
    changes: number
}

export async function insert(table: string, data: Record<any, any>): Promise<Result> {
    const columns = Object.keys(data).join(",")
    const values = Object.values(data)
    const placeholders = values.map(() => '?').join(",")

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`
    try {
        if (config.database.type === 'sqlite') {
            const result = sqlite.exec(sql, values)
            return {
                //@ts-ignore
                lastID: result.lastInsertRowid,
                changes: result.changes
            }
        }
        if (config.database.type === 'mysql') {
            const result = await mysql.execute(sql, values)
            return {
                //@ts-ignore
                lastID: result[0].insertId-1+result[0].affectedRows,
                //@ts-ignore
                changes: result[0].affectedRows
            }
        }
    } catch(e: any) {
        logger.error(`SQL语句查询时出错：${sql}`)
        logger.error(`${e.name}: ${e.message}`)
    }
    throw new Error()
}
export async function insertMany(table: string, key: string[], value: any[][]): Promise<Result> {
    value.forEach((value, rowIndex) => {
        if (value.length !== key.length) 
            throw new DatabaseError(`插入数据与列不对应。第${rowIndex}个数据：${key.map((key, valueIndex)=>`${key}: ${JSON.stringify(value[valueIndex])||"<此处缺失>"}`).join(", ")}`)
    })
    const columns = key.join(",")
    const data = value.flat()
    const placeholders = value.map((value) => "("+value.map(() => "?").join()+")").join(",")

    const sql = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}`

    try {
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
    } catch(e: any) {
        logger.error(`SQL语句查询时出错：${sql}`)
        logger.error(`${e.name}: ${e.message}`)
    }
    throw new Error()
}

function sqliteWHERE(where?: string) {
    let index = 1
    return where ? "WHERE " + where.replace(/\?/g, ()=>{return "?"+index++}) : ""
}

function sqlWHERE(where?: string) {
    return where ? `WHERE ${where}` : ""
}

export async function query(table: string, column: string[]|"*"): Promise<any[]>;
export async function query(table: string, column: string[]|"*", where: string, whereParam: any[]): Promise<any[]>;
export async function query(table: string, column: string[]|"*", where?: string, whereParam?: any[]): Promise<any[]> {
    const columns = column === "*" ? "*" : column.join(",")
    if (config.database.type === 'sqlite') {
        const sql = `SELECT ${columns} FROM ${table} ${sqliteWHERE(where)}`
        try {
            const result = sqlite.query(sql)
            if (whereParam === undefined) {
                debugger
                return result.all()
            } else {
                return result.all(...whereParam)
            }
        } catch(e: any) {
            logger.error(`SQL语句查询时出错：${sql}`)
            logger.error(`${e.name}: ${e.message}`)
        }
    }
    if (config.database.type === 'mysql') {
        const sql = `SELECT ${columns} FROM ${table} ${sqlWHERE(where)}`
        try {
            if (whereParam === undefined) {
                const rows = await mysql.execute(sql)
                //@ts-ignore
                return rows[0]
            } else {
                const rows = await mysql.execute(sql, whereParam)
                //@ts-ignore
                return rows[0]
            }
        } catch(e: any) {
            logger.error(`SQL语句查询时出错：${sql}`)
            logger.error(`${e.name}: ${e.message}`)
        }
    }
    throw new Error()
}

export async function update(table: string, data: Record<string, any>): Promise<Result>
export async function update(table: string, data: Record<string, any>, where: string, whereParam: any[]): Promise<Result>
export async function update(table: string, data: Record<string, any>, where?: string, whereParam?: any[]): Promise<Result> {
    const columns = Object.keys(data).map((key) => key+"=?").join(",")
    const values = Object.values(data)
    const sql = `UPDATE ${table} SET ${columns} ${sqlWHERE(where)}`
    try {
        if (config.database.type === 'sqlite') {
            if (whereParam === undefined) {
                const result = sqlite.exec(sql, [...values])
                return {
                    // @ts-ignore
                    lastID: result.lastInsertRowid,
                    changes: result.changes
                }
            } else {
                const result = sqlite.exec(sql, [...values, ...whereParam])
                return {
                    // @ts-ignore
                    lastID: result.lastInsertRowid,
                    changes: result.changes
                }
            }
        }
        if (config.database.type === 'mysql') {
            if (whereParam === undefined) {
                const result = await mysql.execute(sql, [...values])
                return {
                    //@ts-ignore
                    lastID: result[0].insertId-1+result[0].affectedRows,
                    //@ts-ignore
                    changes: result[0].affectedRows
                }
            } else {
                const result = await mysql.execute(sql, [...values, ...whereParam])
                return {
                    //@ts-ignore
                    lastID: result[0].insertId-1+result[0].affectedRows,
                    //@ts-ignore
                    changes: result[0].affectedRows
                }
            }
        }
    } catch(e: any) {
        logger.error(`SQL语句查询时出错：${sql}`)
        logger.error(`${e.name}: ${e.message}`)
    }
    throw new Error()
}

export async function remove(table: string): Promise<Result>
export async function remove(table: string, where: string, whereParam: any[]): Promise<Result>
export async function remove(table: string, where?: string, whereParam?: any[]): Promise<Result> {
    const sql = `DELETE FROM ${table} ${sqlWHERE(where)}`
    try {
        if (config.database.type === 'sqlite') {
            if (whereParam === undefined) {
                const result = sqlite.exec(sql)
                return {
                    // @ts-ignore
                    lastID: result.lastInsertRowid,
                    changes: result.changes
                }
            } else {
                const result = sqlite.exec(sql, whereParam)
                return {
                    // @ts-ignore
                    lastID: result.lastInsertRowid,
                    changes: result.changes
                }
            }
        }
        if (config.database.type === 'mysql') {
            if (whereParam === undefined) {
                const result = await mysql.execute(sql)
                return {
                    //@ts-ignore
                    lastID: result[0].insertId-1+result[0].affectedRows,
                    //@ts-ignore
                    changes: result[0].affectedRows
                }
            } else {
                const result = await mysql.execute(sql, whereParam)
                return {
                    //@ts-ignore
                    lastID: result[0].insertId-1+result[0].affectedRows,
                    //@ts-ignore
                    changes: result[0].affectedRows
                }
            }
        }
    } catch(e: any) {
        logger.error(`SQL语句查询时出错：${sql}`)
        logger.error(`${e.name}: ${e.message}`)
    }
    throw new Error()
}

export async function exist(table: string, where: string, whereParam: any[]) {
    return (await query(table, "*", where, whereParam)).length !== 0
}