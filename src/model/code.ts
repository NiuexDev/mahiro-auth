import { randomUUID } from "crypto"
import { UUID } from "mongodb"
import { model, Schema } from "mongoose"

const char = Array.from("23456789ABCDEFGHJKLMNPQRSTUVWXYZ")

const codeSchema = new Schema({
    id: { type: UUID, required: true, unique: true, index: true },
    key: { type: String, required: true },
    code: { type: String, required: true },
    expires: { type: Date, required: true, expires: 0 }
}, {
    statics: {
        async generate(key: string, length: number, expires: number) {
            const code = Array.from({ length }, () => char[Math.floor(Math.random() * char.length)]).join("")
            const expiresTime = new Date(Date.now() + expires*1000)
            const document = await this.create({
                id: randomUUID(),
                key,
                code,
                expires: expiresTime
            })
            return {
                id: document.id,
                key: document.key,
                code: document.code,
                expires: document.expires
            }
        },
        async verify(id: string, key: string, code: string) {
            const document = await this.findOne({ id, key, code, expires: { $gt: new Date() } })
            return document !== null
        }
    }
})

export const Code = model("code", codeSchema)