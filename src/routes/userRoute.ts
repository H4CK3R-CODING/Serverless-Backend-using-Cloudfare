import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";

export const userRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRET_KEY: string;
  };
}>();

userRoute.post("signup", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });

    const jwt = await sign(
      {
        id: user.id,
      },
      c.env.SECRET_KEY
    );

    return c.json({
        jwt
    });
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.text("wrong creds");
  }
});

userRoute.post("/signin", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user) {
      c.status(403);
      return c.json({
        msg: "unauthorised !",
      });
    }

    const jwt = await sign(
      {
        id: user.id,
      },
      c.env.SECRET_KEY
    );

    return c.json({
        jwt
    });
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.text("wrong creds");
  }
});
