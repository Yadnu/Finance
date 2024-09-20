import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { error } from 'console'
export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})
    .get('/hello/:testId',clerkMiddleware(), (c)=>{
        const auth = getAuth(c);
        if(!auth?.userId){
            return c.json({
                error: "Unauthorized user"
            })
        }
        return c.json({
            message:[{
                text: "Hi there",

            },{
                testId: c.req.param("testId"),
            }] 
            
        }
        )
    })
export const GET = handle(app)
export const POST = handle(app)