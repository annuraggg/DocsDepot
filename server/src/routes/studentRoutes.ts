import { Hono } from "hono";
import {
  getDashboardData,
  updateFirstTimeData,
} from "../controllers/student/dashboardController.js";
import {
  getCertificates,
  uploadCertificate,
  downloadCertificate,
  deleteCertificate,
  updateCertificate,
} from "../controllers/student/certificateController.js";

const app = new Hono();

app.post("/", getDashboardData);
app.post("/firstTime", updateFirstTimeData);

app.get("/certificates", getCertificates);
app.post("/certificates/upload", uploadCertificate);
app.post("/certificates/download", downloadCertificate);
app.post("/certificates/delete", deleteCertificate);
app.post("/certificates/update", updateCertificate);

export default app;
