import { userSchema, userModel } from "@/model/user"
import { generate } from "@/model/verification-code"
import { getLogger } from "@/service/logger"
import { setRouter } from "@/service/router"
import { defineEventHandler, eventHandler, readBody, setResponseStatus } from "h3"
import { Binary } from "mongodb"
import { APIType } from "~/type/api/common"
import { getVcode } from "~/type/api/getvcode"
import { isEamil } from "~/type/validator/email"
import { vcodeLength } from "~/type/validator/vcode"
import { NumberValidator, StringValidator, verify } from "~/util/schema"


setRouter("post", getVcode.endpoint, eventHandler(async (event): Promise<getVcode.Response> => {
    const body: getVcode.Request = await readBody(event)
    const verifyResult = verify(body, { type: new NumberValidator(), email: new StringValidator() })
    if (verifyResult !== true) {
        setResponseStatus(event, 400)
        return {
            state: APIType.ResponseType.error,
            reason: verifyResult
        }
    }
    if (!Object.values(getVcode.VcodeType).includes(body.type)) return {
        state: APIType.ResponseType.error,
        reason: "类型参数错误"
    }
    if (!isEamil(body.email)) return {
        state: APIType.ResponseType.error,
        reason: "邮箱格式不合法"
    }

    const userExist = await userModel.exists({ email: body.email })
    switch (body.type) {
        case getVcode.VcodeType.register: {
            if (userExist !== null) return {
                state: APIType.ResponseType.fail,
                type: getVcode.FailType.userExist,
            }
            break
        }
        case getVcode.VcodeType.login:
        case getVcode.VcodeType.resetpasswd: {
            if (userExist === null) return {
                state: APIType.ResponseType.fail,
                type: getVcode.FailType.userNotExist,
            }
            break
        }
    }

    
    const expires = 5*60
    const vcode = await generate(body.email, vcodeLength, expires)
    getLogger("vcode").debug(JSON.stringify(vcode))
    return {
        state: APIType.ResponseType.success,
        data: {
            vcodeid: (vcode._id as Binary).toString("base64")
        }
    }
}))

const register = async (body: getVcode.Request) => {
    
}