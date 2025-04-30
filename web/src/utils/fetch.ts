import { config } from "@/../config"
import { useBaseUrl } from "~/util/useBaseUrl"

export const fetch = async <Req, Res>(url: string, request: Req): Promise<Res> => {
    const req = globalThis.fetch(
        useBaseUrl(config.apiUrl, url),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        }
    )
    return await (await req).json()
}