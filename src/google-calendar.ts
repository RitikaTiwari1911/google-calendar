import express, { NextFunction, Request, Response } from "express";
import { authenticate } from "@google-cloud/local-auth";
import path from "path";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
const CREDENTIALS_PATH = path.join(process.cwd(), "key.json");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const router = express.Router();

router.post(
  "/init/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        client_id,
        project_id,
        auth_uri,
        token_uri,
        auth_provider_x509_cert_url,
        client_secret,
        redirect_uris,
      } = req.body;

      if (
        !(
          client_id &&
          project_id &&
          auth_uri &&
          token_uri &&
          auth_provider_x509_cert_url &&
          client_id &&
          client_secret&&
          redirect_uris
        )
      ) {
        res.status(400).json({
          status: 400,
          message: `All parameters are required`,
        });
      }

      const payload: any = {
        web: req.body,
      };

      fs.writeFileSync("key.json", JSON.stringify(payload));
      console.log("result", req.body);
      res.status(200).json({
        status: 200,
        message: `User Credential Added`,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/redirect/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getTokenAndRedirect();
      console.log("result", result);
      res.status(200).json({
        status: 200,
        message: `Calendar list fetch successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

const getTokenAndRedirect = async () => {
  const client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  const calendarData = google.calendar({ version: "v3", auth: client });
  const { data } = await calendarData.calendars.get({ calendarId: "primary" });
  console.log(data);
const keyData = JSON.parse(fs.readFileSync("key.json", 'utf-8'))
  const oauth2Client = new OAuth2Client({
    clientId:
     keyData?.web.client_id,
    clientSecret: keyData?.web.client_secret,
    redirectUri: keyData?.web.redirect_uris,
  });

  // Set the access token for the client
  oauth2Client.setCredentials({
    access_token: client.credentials.access_token,
    refresh_token: client.credentials.refresh_token,
  });

  // Create a calendar API client
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const allEvents: any = [];
  // Retrieve a list of events from the user's primary calendar
  calendar.events.list(
    {
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    },
    (err, res) => {
      if (err) return console.error("The API returned an error: " + err);
      const events = res?.data.items;

      if (events?.length) {
        console.log("Upcoming events:");
        // events.map((event: any, i: any) => {

        for (let i = 0; i <= events.length; i++) {
          let eventNew = events[i];
          const start = eventNew?.start?.dateTime || eventNew?.start?.date;
          allEvents.push(`${start} - ${eventNew?.summary}`);
          console.log(`${start} - ${eventNew?.summary}`);
        }

        // });
      } else {
        console.log("No upcoming events found.");
      }
    }
  );
  console.log(allEvents);
  return allEvents;
};

export default router;
