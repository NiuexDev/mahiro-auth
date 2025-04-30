// import { isEamil, isSecurePassword } from "@/util/regexp"
import { log } from "console"
import { defineEventHandler, readBody, readRawBody, readValidatedBody, sanitizeStatusCode, send, sendWebResponse, setResponseStatus } from "h3"
import { User } from "@/model/user"
import { setRouter } from "@/service/router"
import { register } from "~/type/api/register"

interface schema {
    email: string
    password: string
    encrypted: string
    code: string
    codeid: string
}

export default defineEventHandler(async (event) => {
    const body: schema = await readBody(event)
    log(body)
    if (
        body.email === undefined ||
        typeof body.email !== "string" ||
        body.password === undefined ||
        typeof body.password !== "string"
        || body.code === undefined ||
        typeof body.code !== "string"
        || body.codeid === undefined ||
        typeof body.codeid !== "string"
    ) {
        sendWebResponse(event, new Response(null, {status: 400}))
        return null
    }
    if (!isEamil(body.email)) {
        return {
            state: "fail",
            reason: "eamil"
        }
    }
    if (!isSecurePassword(body.password)) {
        return {
            state: "fail",
            reason: "password"
        }
    }
    // if (!await Code.verify(body.codeid, body.email, body.code)) {
    //     return {
    //         state: "fail",
    //         reason: "code"
    //     }
    // }
    if (await User.exists({ email: body.email })) {
        return {
            state: "fail",
            reason: "registered"
        }
    }
    const userId = await User.register(body.email, body.password)
    return {
        state: "success",
        id: userId,
    }
})

// setRouter(register)