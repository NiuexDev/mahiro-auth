import { userSchema, userModel } from "@/model/user"
import { generate, vcodeModel } from "@/model/verification-code"
import { getLogger } from "@/service/logger"
import { setRouter } from "@/service/router"
import { defineEventHandler, eventHandler, readBody, setResponseStatus } from "h3"
import { Binary } from "mongodb"
import { CommonAPI } from "~/type/api/common"
import { GetVcodeAPI } from "~/type/api/getvcode"
import { isEamil } from "~/type/validator/email"
import { vcodeLength } from "~/type/validator/vcode"
import { NumberValidator, StringValidator, verify } from "~/util/schema"


setRouter("post", GetVcodeAPI.endpoint, eventHandler(async (event): Promise<GetVcodeAPI.Response> => {
    const body: GetVcodeAPI.Request = await readBody(event)
    const verifyResult = verify(body, { type: new NumberValidator(), email: new StringValidator() })
    if (verifyResult !== true) {
        return {
            state: CommonAPI.ResponseStatus.ERROR,
            reason: verifyResult
        }
    }
    if (!Object.values(GetVcodeAPI.VcodeType).includes(body.type)) return {
        state: CommonAPI.ResponseStatus.ERROR,
        reason: "类型参数错误"
    }
    if (!isEamil(body.email)) return {
        state: CommonAPI.ResponseStatus.ERROR,
        reason: "邮箱格式不合法"
    }

    if (await vcodeModel.findOne({
        email: body.email,
        createdAt: {
            $gt: Date.now() - 60 * 1000
        }
    }) !== null) return {
        state: CommonAPI.ResponseStatus.FAIL,
        type: GetVcodeAPI.FailType.REQUEST_TOO_FAST,
    }

    const userExist = await userModel.exists({ email: body.email })
    switch (body.type) {
        case GetVcodeAPI.VcodeType.REGISTER: {
            if (userExist !== null) return {
                state: CommonAPI.ResponseStatus.FAIL,
                type: GetVcodeAPI.FailType.USER_EXIST,
            }
            break
        }
        case GetVcodeAPI.VcodeType.LOGIN:
        case GetVcodeAPI.VcodeType.RESETPASSWD: {
            if (userExist === null) return {
                state: CommonAPI.ResponseStatus.FAIL,
                type: GetVcodeAPI.FailType.USER_NOT_EXIST,
            }
            break
        }
    }

    const vcode = await generate(body.email, vcodeLength, 5 * 60)
    getLogger("vcode").debug(JSON.stringify(vcode))
    return {
        state: CommonAPI.ResponseStatus.SUCCESS
    }
}))

// const register = async (body: getVcode.Request) => {
    
// }