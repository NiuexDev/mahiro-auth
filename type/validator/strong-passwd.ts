const uppurCaseRegExp = new RegExp(/[A-Z]/)
const lowerCaseRegExp = new RegExp(/[a-z]/)
const numberRegExp = new RegExp(/[0-9]/)
const symbolRegExp = new RegExp(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/? ]/)
const characterRegExp = new RegExp(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/)

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