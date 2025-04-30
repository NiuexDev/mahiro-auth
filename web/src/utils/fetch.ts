import useApiUrl from "@/utils/useApiUrl"

export const fetch = async <Req, Res>(url: string, request: Req): Promise<Res> => {
    const req = globalThis.fetch(
        useApiUrl(url),
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