import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRET_KEY: string;
  },
  Variables:{
    userId: string,
  },
}>();

blogRoute.use("/*", async(c, next)=>{
    const jwt = c.req.header("auth-user") || ""
    try {
        const user =await verify(jwt,c.env.SECRET_KEY)
        if(user){
            c.set("userId",String(user.id))
            // console.log(user.id)
            await next()
        }
        else{
            c.status(403)
            return c.json({
                msg: "User not exist"
            })
        }
    } catch (error) {
        console.log(error)
        c.status(403)
        return c.json({
            msg: "User is not LogedIn"
        })
    }


})

blogRoute.post("/",async(c)=> {
    const body = await c.req.json()
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: authorId,
            }
        })

        return c.json({
            post
        })

    } catch (error) {
        console.log(error)
        c.status(400)
        return c.json({
            msg: "post can not creates."
        })
    }

})

blogRoute.get("/bulk",async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const post = await prisma.post.findMany()

        return c.json({
            post
        })

    } catch (error) {
        console.log(error)
        c.status(400)
        return c.json({
            msg: "post can not creates."
        })
    }
})


blogRoute.put("/:id",async (c)=>{
    const body = await c.req.json()
    const id = c.req.param("id")
    console.log(id)
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const post = await prisma.post.update({
            where: {
                id: String(id)
            },
            data: {
                title: body.title,
                content: body.content,
            }
        })

        return c.json({
            post
        })

    } catch (error) {
        console.log(error)
        c.status(400)
        return c.json({
            msg: "post can not update."
        })
    }
})

blogRoute.get("/:id",async (c)=>{
    const id = c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const post = await prisma.post.findFirst({
            where:{
                id: String(id)
            }
        })

        return c.json({
            post
        })

    } catch (error) {
        console.log(error)
        c.status(400)
        return c.json({
            msg: "post can not fetch."
        })
    }
})

