import { Hono } from "hono";
import certificationController from "../controllers/certificateController.js";

const app = new Hono();

app.get("/", certificationController.getCertificates);
app.get("/student", certificationController.getStudentCertificates);
app.get("/faculty", certificationController.getFacultyCertificates);
app.get("/user", certificationController.getCertificatesByUserId);
app.get("/user/:id", certificationController.getCertificatesByUserId);
app.get("/:id", certificationController.getCertificateById);


app.get("/:id/download", certificationController.downloadCertificate);

app.post("/", certificationController.createCertificate);

app.put("/:id", certificationController.updateCertificate);

app.delete("/:id", certificationController.deleteCertificate);

app.post("/:id/comment", certificationController.commentOnCertificate);

export default app;
