import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'

const app = new Hono().basePath('/api')

app.get('/hello', (c) => {
  return c.json({
    message: 'Hello Next.js!',
  })
})
    .get('/hello/:testId', (c)=>{
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