export function isEamil(email: string) {
    return new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/).test(email)
}