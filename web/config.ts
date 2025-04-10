const isViteEnv = !!(
    typeof import.meta !== 'undefined' && 
    import.meta.env && 
    (import.meta.env.DEV || import.meta.env.PROD)
)

export const createConfig = () => {
    return {
        apiBaseUrl: isViteEnv ? "http://localhost:10721" : "/api",
        title: "北屿验证",
        description: "string",
    }
}

export const config = createConfig()
