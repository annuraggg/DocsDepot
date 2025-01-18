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

export default app;
