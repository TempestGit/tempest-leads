import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";

import healthRoutes from "./routes/health.routes.js";

import authRoutes from "./modules/auth/auth.routes.js";
import companiesRoutes from "./modules/companies/companies.routes.js";
import contactsRoutes from "./modules/contacts/contacts.routes.js";
import leadsRoutes from "./modules/leads/leads.routes.js";
import activitiesRoutes from "./modules/activities/activities.routes.js";
import meetingsRoutes from "./modules/meetings/meetings.routes.js";
import followupsRoutes from "./modules/followups/followups.routes.js";

import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// Testing

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Request Parsing
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TEMPEST LEADS API",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/meetings", meetingsRoutes);
app.use("/api/followups", followupsRoutes);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

export default app;