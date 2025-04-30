import { ValueValidator } from "~/util/schema"

export const EmailRegExp = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
export const isEamil = (email: string) => EmailRegExp.test(email)

export class EmailValidator extends ValueValidator { 
    private value: string;
    private error: string;
    constructor(value: string = "", error: string = "须为合法的邮箱") {
        super()
        this.value = value
        this.error = error
    }
    create() {
        return this.value
    }
    verify(value: any) {
        if (typeof value === "string" && !isEamil(value)) {
            return this.error
        }
    }
}