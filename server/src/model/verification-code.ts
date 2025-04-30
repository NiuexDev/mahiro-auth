import { randomUUID } from "crypto"
import { UUID } from "mongodb"
import { Model, model, Schema } from "mongoose"
import { vcodeCharList as char, vcodeLength } from "~/type/validator/vcode"

export const vcodeSchema = new Schema({
    id: { type: UUID, required: true, unique: true, index: true },
    key: { type: String, required: true },
    code: { type: String, required: true },
    expires: { type: Date, required: true, expires: 0 }
}, {
    statics: {
        async generate(key: string/*, length: number, expires: number*/) {
            const code = Array.from({ length: vcodeLength }, () => char[Math.floor(Math.random() * char.length)]).join("")
            const expiresTime = new Date(Date.now() + 5*60*1000)
            return (await this.create({
                id: randomUUID(),
                key,
                code,
                expires: expiresTime
            })).toObject()
        },
        async verify(id: string, key: string, code: string) {
            const document = await this.findOne({ id })
            if (document === null) return false
            document?.key === key && document?.code === code && document?.expires > new Date()
            return document !== null
        }
    }
})

export const vcodeModel = model("vcode", vcodeSchema)