"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const winston_1 = __importDefault(require("winston"));
// Default exported function that will set up Winston for logging
// Getting the required function from the format module
const { combine, timestamp, label, printf } = winston_1.default.format;
// Creating a custom formats for logs
const customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp}, ${level.toUpperCase()} [${label}] => ${message}`;
});
const httpFormat = printf(({ level, message, label }) => {
    return `${level.toUpperCase()} [${label}] => ${message}`;
});
// Create a logger using winston
const logger = winston_1.default.createLogger({
    // Setting the level to log info or higher only
    level: "info",
    // Using the custom format for logging
    transports: [
        new winston_1.default.transports.Console({
            level: "info",
            format: combine(
            // winston.format.colorize({ colors }),
            label({ label: "APP_BUILDER.SERVER" }), timestamp({ format: "YYYY-MM-DDTHH:mm:ss:ms" }), customFormat),
        }),
    ],
    // Do not exit application in case of an error
    exitOnError: false,
});
// If environment is not production, then log all levels to the console as well
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston_1.default.transports.Console({
        level: "silly",
        format: winston_1.default.format.simple(),
    }));
}
// Logger for HTTP requests only
exports.httpLogger = winston_1.default.createLogger({
    level: "http",
    transports: [
        new winston_1.default.transports.Console({
            level: "http",
            format: combine(label({ label: "NEAR.SERVER" }), httpFormat),
        }),
    ],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map