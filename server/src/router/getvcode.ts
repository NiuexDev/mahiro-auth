import { vcodeModel } from "@/model/verification-code"
import { getLogger } from "@/service/logger"
import { setRouter } from "@/service/router"
import { defineEventHandler, eventHandler, readBody, setResponseStatus } from "h3"
import { getVcode } from "~/type/api/getvcode"
import { verify } from "~/util/schema"


setRouter("post", getVcode.endpoint, eventHandler(async (event): Promise<getVcode.Response> => {
    const body: getVcode.Request = await readBody(event)
    const verifyResult = verify(body, getVcode.Shema)
    if (verifyResult !== true) {
        setResponseStatus(event, 400)
        return {
            state: "error",
            reason: verifyResult
        }
    }
    const vcode = await vcodeModel.generate(body.email)
    getLogger("vcode").debug(JSON.stringify(vcode))
    return {
        state: "success",
        data: {
            vcodeid: vcode.id as string
        }
    }
}))