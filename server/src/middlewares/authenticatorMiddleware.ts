import { Token } from "scriptopia-types/Token.js";
import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";

const DEFAULT_USER: Token = {
  _id: "",
  house: "",
  mid: "",
  fname: "",
  lname: "",
  profilePicture: "",
  role: "",
  perms: [],
  ay: 0,
  branch: "",
};

const attachAuth = createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  let user: Token = { ...DEFAULT_USER };

  if (token) {
    try {
      user = verifyToken(token);
    } catch (error) {
      user = { ...DEFAULT_USER };
    }
  }

  c.set("user", user);
  await next();
});

// Middleware to ensure the user is authenticated
const ensureAuth = createMiddleware(async (c, next) => {
  const user = c.get("user") as Token;

  if (!user.mid) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  await next();
});

const verifyToken = (token: string): Token => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as Token;
  } catch (error) {
    throw new Error("Token verification failed");
  }
};

export { attachAuth, ensureAuth };
