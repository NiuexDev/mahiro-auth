import { randomUUID } from "crypto"
import { create } from "domain"
import { UUID } from "mongodb"
import { Model, model, Schema } from "mongoose"
import { vcodeCharList as char, vcodeLength } from "~/type/validator/vcode"

export const vcodeSchema = new Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    expires: { type: Date, required: true, expires: 0 }
})

export const vcodeModel = model("vcode", vcodeSchema, "vcode")

export const generate = async (email: string, length: number, expires: number) => {
    const code = Array.from({ length: length }, () => char[Math.floor(Math.random() * char.length)]).join("")
    await vcodeModel.create({
        email: email,
        code,
        expires: Date.now() + expires * 1000
    })
}

export const verify = async (email: string, code: string) => {
    const document = await vcodeModel.findOneAndDelete({ email, code, expires: { $gt: Date.now() } })
    return document !== null
}