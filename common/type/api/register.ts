import type { Enum } from "~/type/enum"
import { CommonAPI } from "~/type/api/common"

export namespace RegisterAPI {
    export const endpoint = "/register"

    export type Request = {
        email: string;
        password: string;
        vcode: string;
    }

    export const FailType = {
        USER_EXIST: 0,
        VCODE_ERROR: 1,
    } as const

    export type Response = {
        state: typeof CommonAPI.ResponseStatus.SUCCESS
        data: {
            session: string
        }
    } | CommonAPI.FailResponse<typeof FailType>
    | CommonAPI.ErrorResponse
}    
