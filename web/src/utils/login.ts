export const login = (session: string) => {
    localStorage.setItem("session", session)
}