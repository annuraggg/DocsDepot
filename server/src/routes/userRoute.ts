import { Hono } from "hono";
import userController from "../controllers/userController.js";

const app = new Hono();

app.get("/all", userController.getAllUsers);
app.get("/students", userController.getAllStudents);
app.get("/faculty", userController.getAllFaculty);
app.get("/admins", userController.getAllAdmins);
app.get("/:mid", userController.getUserByMid);
app.get("/id/:id", userController.getUserById);
app.put("/:id", userController.updateUser);
app.delete("/:id", userController.deleteUser);
app.post("/student", userController.createStudent);
app.post("/faculty", userController.createFaculty);
app.post("/student/bulk", userController.bulkCreateStudents);
app.post("/faculty/bulk", userController.bulkCreateFaculty);
app.delete("/bulk", userController.bulkDeleteUsers);a

export default app;
