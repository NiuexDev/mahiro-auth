import { randomUUID } from "crypto"
import { Binary, UUID } from "mongodb"
import { model, Schema } from "mongoose"

export const sessionSchema = new Schema({
    _id: { type: UUID, default: randomUUID },
    user: { type: UUID, ref: "user" },
    expires: Date
})

export const sessionModel = model("session", sessionSchema, "session")

export const generate = async (userId: any) => {
    const session = await sessionModel.create({
        user: userId,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7
    })
    return (session._id as Binary).toString("hex")
}