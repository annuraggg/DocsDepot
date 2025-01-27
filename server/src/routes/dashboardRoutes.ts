import { Hono } from "hono";
import dashboardController from "../controllers/dashboardController.js";

const app = new Hono();

app.get("/student", dashboardController.getStudentDashboard);
app.get("/admin", dashboardController.getAdminDashboard);

export default app;
