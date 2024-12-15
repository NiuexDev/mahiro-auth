import { randomUUID } from "crypto"
import * as Database from "@/service/database"

setInterval(async () => {
    await Database.remove(tableName, "expires<?", [Date.now() / 1000 >> 0])
}, 60 * 60 * 1000)

const tableName = "code"

const charSet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

const mysqlTable = `
    id CHAR(32) PRIMARY KEY,
    code CHAR(7) NOT NULL,
    expires BIGINT UNSIGNED NOT NULL`

const sqliteTable = `
    id CHAR(32) PRIMARY KEY,
    code CHAR(7) NOT NULL,
    expires INTEGER NOT NULL`

async function get(expires: number) {
    const code = Array.from({ length: 7 }, () => charSet[Math.floor(Math.random() * charSet.length)]).join("")
    const id = randomUUID().replaceAll("-", "")
    const time = (Date.now() / 1000 >> 0) + expires
    await Database.insert(tableName, { id, code, expires: time })
    return { id, code }
}

async function verify(id: string, code: string) {
    const codeData = (await Database.query(tableName, ["code", "expires"], "id=?", [id]))[0]
    if (codeData === undefined) {
        return false
    }
    if (codeData.expires < Date.now() / 1000 >> 0) {
        Database.remove(tableName, "id=?", [id])
        return false
    }
    if (codeData.code === code) {
        Database.remove(tableName, "id=?", [id])
        return true
    } else {
        return false
    }
}

export default {
    sqliteTable,
    mysqlTable,
    get,
    verify
}