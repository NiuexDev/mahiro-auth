import { CommonAPI } from "~/type/api/common"
import type { Enum } from "~/type/enum"

export namespace GetVcodeAPI {
    export const endpoint = "/getvcode"

    export const method = "POST"

    export const VcodeType = {
        REGISTER: 0,
        LOGIN: 1,
        RESETPASSWD: 2
    } as const

    export type Request = {
        type: Enum<typeof VcodeType>
        email: string
    }

    export const FailType = {
        USER_EXIST: 0,
        USER_NOT_EXIST: 1,
        REQUEST_TOO_FAST: 2
    } as const

    export type Response = {
        state: typeof CommonAPI.ResponseStatus.SUCCESS
    } | CommonAPI.FailResponse<typeof FailType>
    | CommonAPI.ErrorResponse
}
