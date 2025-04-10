import { UUID } from "mongodb"
import { model, Schema } from "mongoose"
import { randomBytes, randomUUID } from "node:crypto"


const idChar = Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
const idGenerator = () => {
    return Array.from({ length:5 }, ()=>idChar[Math.floor(Math.random() * idChar.length)]).join("") + (Math.floor(Math.random()*1000)).toFixed().padStart(3, "0")
}


const playerSchema = new Schema({
    name: { type: String, required: true, unique: true, default: idGenerator },
    uuid: { type: UUID, required: true, unique: true, default: () => randomUUID() },
    skin: String,
    cape: String,
})

const userInfoSchema = new Schema({
    name: { type: String, required: true, unique: true, default: idGenerator },
    uuid: { type: UUID, required: true, unique: true, default: () => randomUUID() },
    skin: String,
    cape: String,
})


const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    players: playerSchema,
    
    registerTime: { type: Date, default: Date.now },
    lastLoginTime: Date, 
    lastLoginIP: String
}, {
    statics: {
        async register(
            email: string,
            password: string,
        ) {
            this.create({
                email,
                password: await Bun.password.hash(password, {
                    algorithm: "bcrypt",
                    cost: 12
                })
            })
        },
    }
})

export const User = model("user", userSchema)