import "dotenv/config";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import "./db";

import performanceMiddleware from "../middlewares/performanceMiddleware.js";
import { attachAuth } from "../middlewares/authenticatorMiddleware.js";

import authRoutes from "../routes/authRoutes.js";
import enrolmentRoutes from "../routes/enrollmentRoutes.js";
import houseRoutes from "../routes/houseRoutes.js";
import eventsRoutes from "../routes/eventsRoutes.js";
import certificateRoutes from "../routes/certificateRoutes.js";
import notificationRoutes from "../routes/notificationRoutes.js";
import feedbackRoutes from "../routes/feedbackRoutes.js";
import dashboardRoutes from "../routes/dashboardRoutes.js";
import userRoutes from "../routes/userRoute.js";

const app = new Hono();
const port = parseInt(process.env.PORT!);

// Maintainance mode
export let maintainanceMode = false;
export const setMaintainanceMode = (mode: boolean) => {
  maintainanceMode = mode;
};

app.use(prettyJSON());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(performanceMiddleware);
app.use(attachAuth);

app.post("/", (c) => {
  return c.json({ status: "ok", version: process.env.VERSION });
});

app.post("/maintainance", (c) => {
  return c.json({ status: maintainanceMode }, maintainanceMode ? 503 : 200);
});

app.route("/auth", authRoutes);
app.route("/enrollment", enrolmentRoutes);
app.route("/houses", houseRoutes);
app.route("/events", eventsRoutes);
app.route("/certificates", certificateRoutes);
app.route("/notifications", notificationRoutes);
app.route("/feedback", feedbackRoutes);
app.route("/dashboard", dashboardRoutes);
app.route("/user", userRoutes)

app.use('/static/*', serveStatic({ root: './src/' }))

serve({ fetch: app.fetch, port: port });
export default app;
