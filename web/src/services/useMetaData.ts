import type { MetaData } from "@/types/MetaData"
import useApiUrl from "@/utils/useApiUrl"
import { config } from "@/../config"
export async function useMetaData(): Promise<MetaData> {
    // return await(await fetch(useApiUrl("/meta"))).json()
    return config
}