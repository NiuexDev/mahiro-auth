import { randomUUID } from "crypto"
import { UUID } from "mongodb"
import { Model, model, Schema } from "mongoose"
import { vcodeCharList as char, vcodeLength } from "~/type/validator/vcode"

export const vcodeSchema = new Schema({
    _id: UUID,
    key: { type: String, required: true },
    code: { type: String, required: true },
    expires: { type: Date, required: true, expires: 0 }
}, {
    statics: {

    }
})

export const vcodeModel = model("vcode", vcodeSchema, "vcode")

export const generate = async (key: string, length: number, expires: number) => {
    const code = Array.from({ length: length }, () => char[Math.floor(Math.random() * char.length)]).join("")
    return (await vcodeModel.create({
        _id: randomUUID(),
        key,
        code,
        expires: Date.now() + expires * 1000
    })).toObject()
}

export const verify = async (id: string, key: string, code: string) => {
    const document = await vcodeModel.findOne({ _id: Buffer.from(id, "hex") })
    if (document === null) return false
    return document?.key === key && document?.code === code && document?.expires.getTime() > Date.now()
}