import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, decode, verify } from "hono/jwt";
import { userRoute } from "./routes/userRoute";
import { blogRoute } from "./routes/blogRoute";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRET_KEY: string;
  };
}>();

app.route("/api/v1/user", userRoute);
app.route("/api/v1/blog", blogRoute)

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
