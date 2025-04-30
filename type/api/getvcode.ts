import { EmailValidator } from "~/type/validator/email"

export namespace getVcode {
    export const endpoint = "/getvcode"

    export type Request = {
        email: string
    }

    export const Shema = {
        email: new EmailValidator(),
    }

    export type Response = {
        state: "success"
        data: {
            vcodeid: string
        }
    } | {
        state: "error"
        reason: any
    }
}
