import { ValueValidator } from "~/util/schema"

export const EmailRegExp = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
export const isEamil = (email: string) => EmailRegExp.test(email)