import { APIType } from "~/type/api/common"
import type { Enum } from "~/type/enum"

export namespace getVcode {
    export const endpoint = "/getvcode"

    export const method = "POST"

    export const VcodeType = {
        register: 0,
        login: 1,
        resetpasswd: 2
    } as const

    export type Request = {
        type: Enum<typeof VcodeType>
        email: string
    }

    export const FailType = {
        userExist: 0,
        userNotExist: 1
    } as const

    export type Response = {
        state: typeof APIType.ResponseType.success
        data: {
            vcodeid: string
        }
    } | {
        state: typeof APIType.ResponseType.fail,
        type: Enum<typeof FailType>
    } | APIType.ErrorResponse
}
