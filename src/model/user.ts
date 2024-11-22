import * as Database from "@/service/database"
import { hash, compare } from "bcrypt"
import { randomUUID } from "crypto"
import { log } from "console"


export const mysqlTable = `
id INT AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(255) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
uuid CHAR(32) NOT NULL UNIQUE,
name VARCHAR(255) UNIQUE,
skin VARCHAR(255),
cape VARCHAR(255)`

export const sqliteTable = `
id INTEGER PRIMARY KEY AUTOINCREMENT,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
uuid TEXT NOT NULL UNIQUE,
name TEXT UNIQUE,
skin TEXT,
cape TEXT`

const tableName = "user"

interface User {
    id: number
    email: string
    password: string
    uuid: string
    name: string
    skin: string
    cape: string
}

interface modifiable {
    email?: string
    password?: string
    name?: string
    skin?: string
    cape?: string
}

export async function create(email: string, password: string): Promise<number> {
    return (await Database.insert(tableName, {email, password: hash(password, 16), uuid: randomUUID()})).lastID
}

export async function get(where: string, whereParam: any[]): Promise<User[]> {
    return await Database.query(tableName, "*", where, whereParam)
}

export async function exist(where: string, whereParam: any[]) {
    return (await get(where, whereParam)).length === 0 ? false : true
}

export async function modify(id: number, data: modifiable) {
    await Database.update(tableName, data, "id=?", [id])
}

export async function remove(id: number) {
    await Database.remove(tableName, "id=?", [id])
}