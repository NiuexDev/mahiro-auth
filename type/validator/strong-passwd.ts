const uppurCaseRegExp = new RegExp(/[A-Z]/)
const lowerCaseRegExp = new RegExp(/[a-z]/)
const numberRegExp = new RegExp(/[0-9]/)
const symbolRegExp = new RegExp(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/? \uFF00-\uFFEF]/)
const characterRegExp = new RegExp(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u3200-\u32FF]/)

export const hasUpperCase = (str: string) => uppurCaseRegExp.test(str)
export const hasLowerCase = (str: string) => lowerCaseRegExp.test(str)
export const hasNumber = (str: string) => numberRegExp.test(str)
export const hasSymbol = (str: string) => symbolRegExp.test(str)
export const hasCharacter = (str: string) => characterRegExp.test(str)

const length = 8

export const isStrongPasswd = (password: string) => {
    let level = 0
    level += hasUpperCase(password) ? 1 : 0
    level += hasLowerCase(password) ? 1 : 0
    level += hasNumber(password) ? 1 : 0
    level += hasSymbol(password) ? 1 : 0

    return password.length >= length && (level >= 3 || hasCharacter(password))
}