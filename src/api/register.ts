import { getLogger } from "@/service/logger"
import { isEamil, isSecurePassword } from "@/util/regexp"
import { log } from "console"
import { defineEventHandler, readBody, readRawBody, readValidatedBody, sanitizeStatusCode, send, sendWebResponse, setResponseStatus } from "h3"
import User from "@/model/user"
import Code from "@/model/code"

interface schema {
    email: string
    password: string
    encrypted: string
    code: string
    codeid: string
}

export default defineEventHandler(async (event) => {
    const body: schema = JSON.parse(await readBody(event))
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
    if (!await Code.verify(body.codeid, body.code)) {
        return {
            state: "fail",
            reason: "code"
        }
    }
    if (await User.exist("email=?", [body.email])) {
        return {
            state: "fail",
            reason: "registered"
        }
    }
    const userId = await User.create(body.email, body.password)
    return {
        state: "success",
        id: userId,
    }
})