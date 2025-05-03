import { useDataPath } from "./config"
import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { getArgv } from "@/service/cmd"
const { combine, timestamp, label, printf, colorize } = format

export const getLogger = (name: string) => {
    const logger = createLogger({
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
                ),
                level: process.env.develop ? "debug" : "info"
            }),
            new DailyRotateFile({
                datePattern: "YYYY-MM-DD",
                zippedArchive: true,
                filename: "%DATE%.log",
                dirname: useDataPath(getArgv("log-dir") ?? "log")
            })
        ]
    })
    return logger
}