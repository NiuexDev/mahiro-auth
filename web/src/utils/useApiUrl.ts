import { config } from "@/../config"

export default (url: string) => {
    return config.apiBaseUrl.replace(/[/\\]+$/, "") + "/" + url.replace(/^[/\\]+/, "")
}