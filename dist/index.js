"use strict";
// import { google } from "googleapis";
// // import { jwtClient } from "./jwtClient";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// async function main() {
//   const calendar = google.calendar({ version: "v3", auth: jwtClient });
//   const events = await calendar.events.list({
//     calendarId: "jyotitiwari334@gmail.com",
//     timeMin: new Date().toISOString(),
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: "startTime",
//   });
//   console.log(events.data);
// }
// main().catch(console.error);
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./logger"));
const google_calendar_1 = __importDefault(require("./google-calendar"));
// Create an instance of express
const app = (0, express_1.default)();
app.set("trust-proxy", 1);
// Block all unwanted headers using helmet
app.use((0, helmet_1.default)());
// Disable x-powered-by header separately
app.disable("x-powered-by");
// Setup server
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: false,
}));
app.disable("etag"); // Disables caching
morgan_1.default.token("remote-addr", (req) => {
    return req.header("X-Real-IP") || req.ip;
});
app.use((0, morgan_1.default)("common", {
    stream: {
        write: (message) => logger_1.default.http(message),
    },
}));
app.use("/rest/v1/calendar", google_calendar_1.default);
const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
    app
        .listen(parseInt(port.toString()), "0.0.0.0", () => {
        // Listen the express server on the given port and log a message to the logs
        logger_1.default.info(`Server is listening on port ${port}`);
    })
        .on("error", (err) => {
        // In case of an error, log the error to the logs
        logger_1.default.error(JSON.stringify(err));
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map