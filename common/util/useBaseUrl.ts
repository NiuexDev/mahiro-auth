export const useBaseUrl = (base: string, url: string) => {
    return base.replace(/[/\\]+$/, "") + "/" + url.replace(/^[/\\]+/, "")
}