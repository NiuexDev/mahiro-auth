import { isEamil } from "@/util/regexp"
import { log } from "console"
import { defineEventHandler, readBody, setResponseStatus } from "h3"


export default defineEventHandler(async (event) => {
    const body: {email: string} = await readBody(event)

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
    // const code = await Code.generate(body.email, 6, 5*60)
    // sendRegister(code.code, body.email)
    // return {
    //     state: "success",
    //     codeid: code.id,
    // }
})