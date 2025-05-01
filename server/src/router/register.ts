import { log } from "console"
import { defineEventHandler, eventHandler, readBody, sendWebResponse, setResponseStatus } from "h3"
import { encryptedPasswd, userSchema, userModel } from "@/model/user"
import { setRouter } from "@/service/router"
import { register } from "~/type/api/register"
import { StringValidator, verify as verifySchema } from "~/util/schema"
import { isEamil } from "~/type/validator/email"
import { isVcode } from "~/type/validator/vcode"
import { isStrongPasswd } from "~/type/validator/strong-passwd"
import { verify } from "@/model/verification-code"
import { CJKCToUint8Array } from "~/util/encoding"
import { APIType } from "~/type/api/common"

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
            state: APIType.ResponseType.error,
            reason: verifyResult
        }
    }
    if (!isEamil(body.email)) {
        return {
            state: APIType.ResponseType.error,
            reason: "不是合法的邮箱"
        }
    }
    if (!isStrongPasswd(body.password)) {
        return {
            state: APIType.ResponseType.error,
            reason: "密码不安全"
        }
    }
    if (!isVcode(body.vcode)) {
        return {
            state: APIType.ResponseType.error,
            reason: "不是合法的验证码"
        }
    }
    const vcodeid = Buffer.from(CJKCToUint8Array(body.vcodeid)).toString("hex")
    if (uuidRegExp.test(vcodeid) === false) {
        return {
            state: APIType.ResponseType.error,
            reason: "不是合法的验证码id"
        }
    }

    if (!await verify(vcodeid, body.email, body.vcode)) {
        return {
            state: APIType.ResponseType.fail,
            type: register.FailType.vcodeError
        }
    }
    if (await userModel.exists({ email: body.email }) !== null) {
        return {
            state: APIType.ResponseType.fail,
            type: register.FailType.userExist
        }
    }

    userModel.create({
        email: body.email,
        password: await encryptedPasswd(body.password)
    })

    return {
        state: APIType.ResponseType.success,
        data: {
        }
    }
}))