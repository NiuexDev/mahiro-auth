import { log } from "console"
import { defineEventHandler, eventHandler, readBody, sendWebResponse, setResponseStatus } from "h3"
import { encryptedPasswd, User, userModel } from "@/model/user"
import { setRouter } from "@/service/router"
import { register } from "~/type/api/register"
import { StringValidator, verify as verifySchema } from "~/util/schema"
import { isEamil } from "~/type/validator/email"
import { isVcode } from "~/type/validator/vcode"
import { isStrongPasswd } from "~/type/validator/strong-passwd"
import { verify } from "@/model/verification-code"

const uuidRegExp = new RegExp(/^[0-9a-fA-F]{32}$/)

setRouter("post", register.endpoint, eventHandler(async (event): Promise<register.Response> => {
    const body: register.Request = await readBody(event)
    const verifyResult = verifySchema(body, {
        email: new StringValidator(),
        password: new StringValidator(),
        vcode: new StringValidator(),
        vcodeid: new StringValidator()
    })
    if (verifyResult !== true) {
        setResponseStatus(event, 400)
        return {
            state: "error",
            reason: verifyResult
        }
    }
    if (!isEamil(body.email)) {
        return {
            state: "error",
            reason: "不是合法的邮箱"
        }
    }
    if (!isStrongPasswd(body.password)) {
        return {
            state: "error",
            reason: "密码不安全"
        }
    }
    if (!isVcode(body.vcode)) {
        return {
            state: "error",
            reason: "不是合法的验证码"
        }
    }
    if (uuidRegExp.test(body.vcodeid) === false) {
        return {
            state: "error",
            reason: "不是合法的验证码id"
        }
    }

    if (await userModel.exists({ email: body.email }) !== null) {
        return {
            state: "fail",
            type: "userExist"
        }
    }

    if (!await verify(body.vcodeid, body.email, body.vcode)) {
        return {
            state: "fail",
            type: "vcodeError"
        }
    }

    userModel.create({
        email: body.email,
        password: await encryptedPasswd(body.password)
    } as User)

    return {
        state: "success",
        data: {
        }
    }
}))