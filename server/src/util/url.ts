import { createServer } from "node:http"
import { join } from "node:path"
export function joinUrl(...urls: string[]): string {
    return join("/", ...urls).replaceAll("\\", "/")
}

