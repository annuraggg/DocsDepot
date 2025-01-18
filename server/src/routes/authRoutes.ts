import { Hono } from "hono";
import authController from "../controllers/authController.js";

const app = new Hono();

app.post("/", authController.login);
app.post("/firsttime", authController.firstTimePassword);

app.get("/profile", authController.getProfile);
app.post("/profile", authController.updateProfile);
app.post("/profile/picture", authController.updateProfilePicture);
app.post("/profile/password", authController.updatePassword);
app.post("/profile/theme", authController.updateTheme);
app.post("/profile/certificate-theme", authController.updateCertificateTheme);

export default app;
