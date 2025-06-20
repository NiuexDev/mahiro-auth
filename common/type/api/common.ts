import type { Enum } from "~/type/enum"

export namespace CommonAPI {
    export const ResponseStatus = {
        SUCCESS: 0,
        FAIL: 1,
        ERROR: 2
    } as const

    export type FailResponse<T extends Record<string, any>> = {
        state: typeof CommonAPI.ResponseStatus.FAIL,
        type: Enum<T>
    }

    export type ErrorResponse = {
        state: typeof ResponseStatus.ERROR,
        reason?: any
    }
}