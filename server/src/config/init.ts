import "dotenv/config";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import "./db";

import performanceMiddleware from "../middlewares/performanceMiddleware.js";

import authRoutes from "../routes/authRoutes.js";
import enrolmentRoutes from "../routes/enrollmentRoutes.js";
import houseRoutes from "../routes/houseRoutes.js";
import eventsRoutes from "../routes/eventsRoutes.js";
import certificateRoutes from "../routes/certificateRoutes.js";
import profileRoutes from "../routes/profileRoutes.js";
import notificationRoutes from "../routes/notificationRoutes.js";
import forgotRoutes from "../routes/forgotRoutes.js";
import feedbackRoutes from "../routes/feedbackRoutes.js";
import generatorRoutes from "../routes/generatorRoutes.js";
// import mainAdmin from "../routes/mainAdmin.js";
// import mainStudent from "../routes/mainStudent.js";
// import mainFaculty from "../routes/mainFaculty.js";


import studentRoutes from "../routes/studentRoutes.js";

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

app.post("/", (c) => {
  return c.json({ status: "ok", version: process.env.VERSION });
});

app.post("/maintainance", (c) => {
  return c.json({ status: maintainanceMode }, maintainanceMode ? 503 : 200);
});

app.route("/auth", authRoutes);
app.route("/firstTime", enrolmentRoutes);
app.route("/houses", houseRoutes);
app.route("/events", eventsRoutes);
app.route("/certificates", certificateRoutes);
app.route("/profile", profileRoutes);
app.route("/notifications", notificationRoutes);
app.route("/forgot", forgotRoutes);
app.route("/feedback", feedbackRoutes);
app.route("/generator", generatorRoutes);

app.route("/student", studentRoutes);
// app.route("/admin", mainAdmin);
// app.route("/faculty", mainFaculty);

serve({ fetch: app.fetch, port: port });
export default app;
