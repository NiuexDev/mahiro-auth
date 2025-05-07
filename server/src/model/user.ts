import { ObjectId, UUID } from "mongodb"
import { model, Schema } from "mongoose"
import { randomBytes, randomUUID } from "node:crypto"
import * as jose from 'jose'


// const idChar = Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
// const idGenerator = () => {
//     return Array.from({ length:5 }, ()=>idChar[Math.floor(Math.random() * idChar.length)]).join("") + (Math.floor(Math.random()*1000)).toFixed().padStart(3, "0")
// }


// const playerSchema = new Schema({
//     name: { type: String, required: true, unique: true, default: idGenerator },
//     uuid: { type: UUID, required: true, unique: true, default: () => randomUUID() },
//     skin: String,
//     cape: String,
// })

// const userInfoSchema = new Schema({
//     name: { type: String, required: true, unique: true, default: idGenerator },
//     uuid: { type: UUID, required: true, unique: true, default: () => randomUUID() },
//     skin: String,
//     cape: String,
// })


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
    return await Bun.password.hash(password, {
        algorithm: "bcrypt",
        cost: 12
    })
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