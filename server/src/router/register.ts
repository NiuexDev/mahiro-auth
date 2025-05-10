import { generate, sessionModel } from "@/model/session"
import { encryptedPasswd, userModel } from "@/model/user"
import { verify } from "@/model/verification-code"
import { setRouter } from "@/service/router"
import { eventHandler, readBody, setResponseStatus } from "h3"
import { CommonAPI } from "~/type/api/common"
import { RegisterAPI } from "~/type/api/register"
import { isEamil } from "~/type/validator/email"
import { isStrongPasswd } from "~/type/validator/strong-passwd"
import { isVcode } from "~/type/validator/vcode"
import { StringValidator, verify as verifySchema } from "~/util/schema"

const uuidRegExp = new RegExp(/^[0-9a-fA-F]{32}$/)

setRouter("post", RegisterAPI.endpoint, eventHandler(async (event): Promise<RegisterAPI.Response> => {
    const body: RegisterAPI.Request = await readBody(event)
    const verifyResult = verifySchema(body, {
        email: new StringValidator(),
        password: new StringValidator(),
        vcode: new StringValidator(),
    })
    if (verifyResult !== true) {
        return {
            state: CommonAPI.ResponseStatus.ERROR,
            reason: verifyResult
        }
    }
    if (!isEamil(body.email)) {
        return {
            state: CommonAPI.ResponseStatus.ERROR,
            reason: "不是合法的邮箱"
        }
    }
    if (!isStrongPasswd(body.password)) {
        return {
            state: CommonAPI.ResponseStatus.ERROR,
            reason: "密码不安全"
        }
    }
    if (!isVcode(body.vcode)) {
        return {
            state: CommonAPI.ResponseStatus.ERROR,
            reason: "不是合法的验证码"
        }
    }

    if (!await verify(body.email, body.vcode)) {
        return {
            state: CommonAPI.ResponseStatus.FAIL,
            type: RegisterAPI.FailType.VCODE_ERROR
        }
    }
    if (await userModel.exists({ email: body.email }) !== null) {
        return {
            state: CommonAPI.ResponseStatus.FAIL,
            type: RegisterAPI.FailType.USER_EXIST
        }
    }

    const user = await userModel.create({
        email: body.email,
        password: await encryptedPasswd(body.password)
    })
    const sessionId = await generate(user._id)

    return {
        state: CommonAPI.ResponseStatus.SUCCESS,
        data: {
            session: sessionId
        }
    }
}))