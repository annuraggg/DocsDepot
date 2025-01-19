import { Hono } from "hono";
import logController from "../controllers/logController.js";

const app = new Hono();

app.get("/", logController.getLogs);

export default app;
