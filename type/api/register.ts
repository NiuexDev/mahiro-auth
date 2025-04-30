export namespace register {
    export const endpoint = "/register"

    export type Request = {
        email: string;
        password: string;
        vcode: string;
        vcodeid: string;
    }

    export type Response = {
        state: "success"
        data: {
        }
    } | {
        state: "fail",
        type: "userExist" | "vcodeError"
    } | {
        state: "error"
        reason: any
    }
}    
