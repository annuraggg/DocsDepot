import { Hono } from "hono";
import userController from "../controllers/userController.js";

const app = new Hono();

app.get("/all", userController.getAllUsers);
app.get("/students", userController.getAllStudents);
app.get("/faculty", userController.getAllFaculty);
app.get("/admins", userController.getAllAdmins);
app.post("/reset", userController.resetPassword);
app.post("/student", userController.createStudent);
app.post("/faculty", userController.createFaculty);
app.get("/not-alloted", userController.getNotAllotedUsers);
app.post("/student/bulk", userController.bulkCreateStudents);
app.post("/faculty/bulk", userController.bulkCreateFaculty);
app.delete("/bulk", userController.bulkDeleteUsers);
app.get("/id/:id", userController.getUserById);
app.get("/:mid", userController.getUserByMid);
app.put("/:id", userController.updateUser);
app.delete("/:id", userController.deleteUser);

export default app;
