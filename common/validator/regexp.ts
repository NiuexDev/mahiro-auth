export function isEamil(email: string) {
    return /^[^\s]+@[^\s]+\.[^\s]{2,}$/.test(email)
}

export function isSecurePassword(password: string) {
    return /.{8,}/.test(password)
}