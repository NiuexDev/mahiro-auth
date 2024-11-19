import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { useConfig } from "./config"
const { combine, timestamp, label, printf, colorize } = format

const config = useConfig()
export const getLogger = (name: string = "main") => createLogger({
    level: "info",
    format: combine(
        label({ label: name }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp, label }) => {
            return `${timestamp} [${level}] [${label}]: ${message}`
        }),
    ),
    transports: [
        new transports.Console({
            consoleWarnLevels: ["warn"],
            stderrLevels: ["error"],
            format: combine(
                colorize({ all: true }),
            )
        }),
        new DailyRotateFile({
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            filename: "%DATE%.log",
            dirname: config.server.logDir
        })
    ]
})