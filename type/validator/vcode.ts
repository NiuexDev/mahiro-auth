import { ValueValidator } from "~/util/schema"

export const vcodeChar = "123456789ABCDEFGHJKLMNPQRSTUVWXYZ"
export const vcodeCharList = vcodeChar.split("")
export const vcodeLength = 5
export const vcodeRegExp = new RegExp(`^[${vcodeChar}]{${vcodeLength}}$`)
export const isVcode = (vcode: string) => vcodeRegExp.test(vcode.toUpperCase())

export class VcodeValidator extends ValueValidator { 
    private value: string;
    private error: string;
    constructor(value: string = "", error: string = "须为合法的验证码") {
        super()
        this.value = value
        this.error = error
    }
    create() {
        return this.value
    }
    verify(value: any) {
        if (typeof value === "string" && !isVcode(value)) {
            return this.error
        }
    }
}