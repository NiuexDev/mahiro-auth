import { CommonAPI } from "~/type/api/common"

export namespace LoginAPI {
    export const endpoint = "/login"
    export const RequestType = {
        PASSWD: 0,
        VCODE: 1,
    } as const
    export type Request = {
        type: typeof RequestType.PASSWD
        email: string;
        password: string;
    } | {
        type: typeof RequestType.VCODE
        email: string;
        vcode: string;
    }
    export const FailType = {
        USER_NOT_EXIST: 0,
        VCODE_ERROR: 1,
        PASSWD_ERROR: 2,
    } as const
    export type Response = {
        state: typeof CommonAPI.ResponseStatus.SUCCESS
        data: {
            session: string
        }
    } | CommonAPI.FailResponse<typeof FailType>
    | CommonAPI.ErrorResponse
}