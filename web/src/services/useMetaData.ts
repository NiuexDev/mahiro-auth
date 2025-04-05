import type { MetaData } from "@/types/MetaData"
import useApiUrl from "@/utils/useApiUrl"
export async function useMetaData(): Promise<MetaData> {
    return await(await fetch(useApiUrl("/meta"))).json()
}