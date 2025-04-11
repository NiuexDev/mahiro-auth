import { log } from "console"
import { name, version } from "./package.json"

log(`${name} v${version}(${process.env.commitHash})`)