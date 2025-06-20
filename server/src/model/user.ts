import { ObjectId, UUID } from "mongodb"
import { model, Schema } from "mongoose"
import { randomUUID, hash } from "node:crypto"
import { compare } from "bcrypt"

export const userSchema = new Schema({
    _id: { type: UUID, required: true, default: randomUUID },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // player: { type: ObjectId, ref: "player" },
    
    registerTime: { type: Date, default: Date.now },
    // lastLoginTime: Date,
    // lastLoginIP: String
})

export const userModel = model("user", userSchema, "user")

/**
 * 
 * @param password 原始密码
 * @returns 加密后的密码
 */
export const encryptedPasswd = async (password: string): Promise<string> => {
    /* return await hash("bcrypt", password) /* Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 12
    }) */
}

const textEncoder = new TextEncoder()

/**
 * 
 * @param id 用户的UUID
 * @returns token 字符串
 */
// export const generateToken = (id: string) => {
//     new jose.CompactEncrypt(textEncoder.encode(JSON.stringify({
//         id
//     })))
//     // .setProtectedHeader({})
//     return randomBytes(32).toString("hex")
// }

// export const register = (
//     email: string,
//     password: string,
// ) => {
//     this.create({
//         email,
//         password: await Bun.password.hash(password, {
//             algorithm: "bcrypt",
//             cost: 12
//         })
//     })
// },

// export e