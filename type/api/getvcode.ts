export namespace getVcode {
    export const endpoint = "/getvcode"

    export type Request = {
        type: "register" | "login" | "resetpasswd"
        email: string
    }
    export type Response = {
        state: "success"
        data: {
            vcodeid: string
        }
    } | {
        state: "fail",
        type: "userExist" | "userNotExist"
    } | {
        state: "error"
        reason: any
    }
}
