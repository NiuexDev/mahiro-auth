import { ValueValidator } from "~/util/schema"

export const vcodeChar = "123456789ABCDEFGHJKLMNPQRSTUVWXYZ"
export const vcodeCharList = vcodeChar.split("")
export const vcodeLength = 5
export const vcodeRegExp = new RegExp(`^[${vcodeChar}]{${vcodeLength}}$`)
export const isVcode = (vcode: string) => vcodeRegExp.test(vcode.toUpperCase())