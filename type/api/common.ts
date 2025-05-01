import { Enum } from "~/type/enum"

export namespace APIType {
    export const ResponseType = {
        success: 0,
        fail: 1,
        error: 2
    } as const

    export type ErrorResponse = {
        state: typeof ResponseType.error,
        reason?: any
    }
}