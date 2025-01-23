import { Hono } from "hono";
import * as houseController from "../controllers/houseController.js";

const app = new Hono();

app.get("/", houseController.getAllHouses);
app.get("/:id", houseController.getHouse);
app.put("/:id", houseController.updateHouse);
app.delete("/:id/member", houseController.removeMember);
app.post("/:id/member", houseController.addMember);
app.put("/:id/logo", houseController.uploadLogo);
app.put("/:id/banner", houseController.uploadBanner);

export default app;
