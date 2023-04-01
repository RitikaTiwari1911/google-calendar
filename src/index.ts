// import { google } from "googleapis";
// // import { jwtClient } from "./jwtClient";

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

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./logger";
import googleCalendar from "./google-calendar";
declare module "express" {
  interface Request {
    user?: any;
  }
}
// Create an instance of express
const app = express();

app.set("trust-proxy", 1);

// Block all unwanted headers using helmet
app.use(helmet());

// Disable x-powered-by header separately
app.disable("x-powered-by");

// Setup server
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.disable("etag"); // Disables caching
morgan.token("remote-addr", (req: any) => {
  return req.header("X-Real-IP") || req.ip;
});
app.use(
  morgan("common", {
    stream: {
      write: (message: any) => logger.http(message),
    },
  })
);

app.use("/rest/v1/calendar", googleCalendar);

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app
    .listen(parseInt(port.toString()), "0.0.0.0", () => {
      // Listen the express server on the given port and log a message to the logs
      logger.info(`Server is listening on port ${port}`);
    })
    .on("error", (err: any) => {
      // In case of an error, log the error to the logs
      logger.error(JSON.stringify(err));
    });
}

export default app;
