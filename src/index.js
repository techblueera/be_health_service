import dotenv from "dotenv";
import { loadSecrets } from "./config/secrets.js";

// Load environment variables from .env file
dotenv.config();

// Secrets must be in process.env before any module that reads env at import
// time is evaluated, so the rest of the app is imported only after they load.
await loadSecrets();
await import("./app.js");
