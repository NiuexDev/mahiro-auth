import { Enum } from "~/type/enum"
import { APIType } from "~/type/api/common"

export namespace register {
    export const endpoint = "/register"

    export type Request = {
        email: string;
        password: string;
        vcode: string;
        vcodeid: string;
    }

    export const FailType = {
        userExist: 0,
        vcodeError: 1,
    } as const

    export type Response = {
        state: typeof APIType.ResponseType.success
        data: {
        }
    } | {
        state: typeof APIType.ResponseType.fail,
        type: Enum<typeof FailType>
    } | {
        state: typeof APIType.ResponseType.error,
        reason: any
    }
}    
