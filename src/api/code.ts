import Code from "@/model/code"
import { Config, useConfig } from "@/service/config"
import { sendRegister } from "@/service/email"
import { isEamil } from "@/util/regexp"
import { log } from "console"
import { defineEventHandler, readBody, setResponseStatus } from "h3"
import { SentMessageInfo, Options } from "nodemailer/lib/smtp-transport"


export default defineEventHandler(async (event) => {
    const body: {email: string} = JSON.parse(await readBody(event))

    // log(typeof body, JSON.parse(body), body.email)
    if (
        body.email === undefined ||
        typeof body.email !== "string"
    ) {
        setResponseStatus(event, 400)
        return null
    }
    log(body)
    if (!isEamil(body.email)) {
        return {
            state: "fail",
            reason: "email"
        }
    }
    const code = await Code.get(5*60)
    log(code)
    sendRegister(code.code, body.email)
    return {
        state: "success",
        codeid: code.id,
    }
})