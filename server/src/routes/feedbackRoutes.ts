import { Hono } from "hono";
import feedbackController from "../controllers/feedbackController.js";

const feedbackRouter = new Hono();

feedbackRouter.post("/", feedbackController.submitFeedback);
feedbackRouter.get("/", feedbackController.getFeedbacks);

export default feedbackRouter;
