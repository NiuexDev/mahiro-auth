import { generate } from "@/model/session"
import { userModel } from "@/model/user"
import { verify as verifyVcode } from "@/model/verification-code"
import { setRouter } from "@/service/router"
import { eventHandler, readBody } from "h3"
import { CommonAPI } from "~/type/api/common"
import { LoginAPI } from "~/type/api/login"
import { isEamil } from "~/type/validator/email"
import { isVcode } from "~/type/validator/vcode"
import { StringValidator, verify as verifySchema } from "~/util/schema"

const sendError = (reason: any) => ({
    state: CommonAPI.ResponseStatus.ERROR,
    reason
})

setRouter("post", LoginAPI.endpoint, eventHandler(async (event): Promise<LoginAPI.Response> => {
    const body = await readBody<LoginAPI.Request>(event)
    if (!Object.values(LoginAPI.RequestType).includes(body.type)) return {
        state: CommonAPI.ResponseStatus.ERROR,
        reason: "类型参数错误"
    }
    switch (body.type) {
        case LoginAPI.RequestType.PASSWD: {
            const verifyResult = verifySchema(body, {
                email: new StringValidator(),
                password: new StringValidator(),
            })
            if (verifyResult !== true) return sendError(verifyResult)
            if (!isEamil(body.email)) return sendError("不是合法的邮箱")

            const user = await userModel.findOne({ email: body.email })
            if (user === null) return {
                state: CommonAPI.ResponseStatus.FAIL,
                type: LoginAPI.FailType.USER_NOT_EXIST,
            }
            // const verify = await Bun.password.verify(body.password, user.password)
            if (!verify) {
                return {
                    state: CommonAPI.ResponseStatus.FAIL,
                    type: LoginAPI.FailType.PASSWD_ERROR,
                }
            } else {
                const session = await generate(user._id)
                return {
                    state: CommonAPI.ResponseStatus.SUCCESS,
                    data: {
                        session: session
                    }
                }
            }   
        }
        case LoginAPI.RequestType.VCODE: {
            const verifyResult = verifySchema(body, {
                email: new StringValidator(),
                vcode: new StringValidator(),
            })
            if (verifyResult !== true) return sendError(verifyResult)
            if (!isEamil(body.email)) return sendError("不是合法的邮箱")
            if (!isVcode(body.vcode)) return sendError("不是合法的验证码")
            const codeVerify = await verifyVcode(body.email, body.vcode)
            if (!codeVerify) {
                return {
                    state: CommonAPI.ResponseStatus.FAIL,
                    type: LoginAPI.FailType.VCODE_ERROR,
                }
            } else {
                const user = await userModel.findOne({ email: body.email })
                if (user === null) {
                    return {
                        state: CommonAPI.ResponseStatus.FAIL,
                        type: LoginAPI.FailType.USER_NOT_EXIST,
                    }
                } else {
                    const session = await generate(user._id)
                    return {
                        state: CommonAPI.ResponseStatus.SUCCESS,
                        data: {
                            session: session
                        }
                    }
                }
            }
        }
        default: return null as any
    }
}))