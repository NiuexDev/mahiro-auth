import { userSchema, userModel } from "@/model/user"
import { generate } from "@/model/verification-code"
import { getLogger } from "@/service/logger"
import { setRouter } from "@/service/router"
import { defineEventHandler, eventHandler, readBody, setResponseStatus } from "h3"
import { getVcode } from "~/type/api/getvcode"
import { isEamil } from "~/type/validator/email"
import { vcodeLength } from "~/type/validator/vcode"
import { StringValidator, verify } from "~/util/schema"


setRouter("post", getVcode.endpoint, eventHandler(async (event): Promise<getVcode.Response> => {
    const body: getVcode.Request = await readBody(event)
    const verifyResult = verify(body, { type: new StringValidator(), email: new StringValidator() })
    if (verifyResult !== true) {
        setResponseStatus(event, 400)
        return {
            state: "error",
            reason: verifyResult
        }
    }
    if (!["register", "login", "resetpasswd"].includes(body.type)) return {
        state: "error",
        reason: "类型参数错误"
    }
    if (!isEamil(body.email)) return {
        state: "error",
        reason: "邮箱格式不合法"
    }

    const userExist = await userModel.exists({ email: body.email })
    switch (body.type) {
        case "register": {
            if (userExist !== null) return {
                state: "fail",
                type: "userExist"
            }
            break
        }
        case "login":
        case "resetpasswd": {
            if (userExist === null) return {
                state: "fail",
                type: "userNotExist"
            }
            break
        }
    }

    const expires = 5*60
    const vcode = await generate(body.email, vcodeLength, expires)
    getLogger("vcode").debug(JSON.stringify(vcode))
    return {
        state: "success",
        data: {
            vcodeid: vcode.id as string
        }
    }
}))

const register = async (body: getVcode.Request) => {
    
}