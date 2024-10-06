import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';  // For filtering data

const app = new Hono();

// Get all accounts
app.get('/accounts', async (c) => {
  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts);
  
  return c.json({ data });
});

// Get a single account by ID
app.get('/accounts/:id', async (c) => {
  const id = c.req.param('id');
  const data = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, id));
  
  if (data.length === 0) {
    return c.json({ error: 'Account not found' }, 404);
  }

  return c.json({ data: data[0] });
});

// Create a new account
app.post('/accounts', async (c) => {
  const body = await c.req.json();
  const result = await db.insert(accounts).values({
    name: body.name,
  });

  return c.json({ message: 'Account created', result }, 201);
});

// Update an account by ID
app.put('/accounts/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  const result = await db
    .update(accounts)
    .set({ name: body.name })
    .where(eq(accounts.id, id));
  
  return c.json({ message: 'Account updated', result });
});

// Delete an account by ID
app.delete('/accounts/:id', async (c) => {
  const id = c.req.param('id');
  
  const result = await db
    .delete(accounts)
    .where(eq(accounts.id, id));

  return c.json({ message: 'Account deleted', result });
});

export default app;
