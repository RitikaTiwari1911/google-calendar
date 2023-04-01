"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const local_auth_1 = require("@google-cloud/local-auth");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
const CREDENTIALS_PATH = path_1.default.join(process.cwd(), "key.json");
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const router = express_1.default.Router();
router.post("/init/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { client_id, project_id, auth_uri, token_uri, auth_provider_x509_cert_url, client_secret, redirect_uris, } = req.body;
        if (!(client_id &&
            project_id &&
            auth_uri &&
            token_uri &&
            auth_provider_x509_cert_url &&
            client_id &&
            client_secret &&
            redirect_uris)) {
            res.status(400).json({
                status: 400,
                message: `All parameters are required`,
            });
        }
        const payload = {
            web: req.body,
        };
        fs_1.default.writeFileSync("key.json", JSON.stringify(payload));
        console.log("result", req.body);
        res.status(200).json({
            status: 200,
            message: `User Credential Added`,
        });
    }
    catch (error) {
        next(error);
    }
}));
router.post("/redirect/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield getTokenAndRedirect();
        console.log("result", result);
        res.status(200).json({
            status: 200,
            message: `Calendar list fetch successfully`,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
const getTokenAndRedirect = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield (0, local_auth_1.authenticate)({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    const calendarData = googleapis_1.google.calendar({ version: "v3", auth: client });
    const { data } = yield calendarData.calendars.get({ calendarId: "primary" });
    console.log(data);
    const keyData = JSON.parse(fs_1.default.readFileSync("key.json", 'utf-8'));
    const oauth2Client = new google_auth_library_1.OAuth2Client({
        clientId: keyData === null || keyData === void 0 ? void 0 : keyData.web.client_id,
        clientSecret: keyData === null || keyData === void 0 ? void 0 : keyData.web.client_secret,
        redirectUri: keyData === null || keyData === void 0 ? void 0 : keyData.web.redirect_uris,
    });
    // Set the access token for the client
    oauth2Client.setCredentials({
        access_token: client.credentials.access_token,
        refresh_token: client.credentials.refresh_token,
    });
    // Create a calendar API client
    const calendar = googleapis_1.google.calendar({ version: "v3", auth: oauth2Client });
    const allEvents = [];
    // Retrieve a list of events from the user's primary calendar
    calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
    }, (err, res) => {
        var _a, _b;
        if (err)
            return console.error("The API returned an error: " + err);
        const events = res === null || res === void 0 ? void 0 : res.data.items;
        if (events === null || events === void 0 ? void 0 : events.length) {
            console.log("Upcoming events:");
            // events.map((event: any, i: any) => {
            for (let i = 0; i <= events.length; i++) {
                let eventNew = events[i];
                const start = ((_a = eventNew === null || eventNew === void 0 ? void 0 : eventNew.start) === null || _a === void 0 ? void 0 : _a.dateTime) || ((_b = eventNew === null || eventNew === void 0 ? void 0 : eventNew.start) === null || _b === void 0 ? void 0 : _b.date);
                allEvents.push(`${start} - ${eventNew === null || eventNew === void 0 ? void 0 : eventNew.summary}`);
                console.log(`${start} - ${eventNew === null || eventNew === void 0 ? void 0 : eventNew.summary}`);
            }
            // });
        }
        else {
            console.log("No upcoming events found.");
        }
    });
    console.log(allEvents);
    return allEvents;
});
exports.default = router;
//# sourceMappingURL=trial.js.map