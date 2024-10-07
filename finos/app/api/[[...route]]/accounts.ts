import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { accounts } from '@/db/schema';
import { eq, like, and } from 'drizzle-orm';  // For more advanced queries

const app = new Hono();

// Get all accounts with optional pagination (limit, offset)
app.get('/accounts', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10');  // Default limit 10
  const offset = parseInt(c.req.query('offset') || '0');  // Default offset 0

  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    .limit(limit)
    .offset(offset);

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

// Get accounts by name (exact match)
app.get('/accounts/name/:name', async (c) => {
  const name = c.req.param('name');
  const data = await db
    .select()
    .from(accounts)
    .where(eq(accounts.name, name));

  if (data.length === 0) {
    return c.json({ error: 'No accounts found with the given name' }, 404);
  }

  return c.json({ data });
});

// Search accounts by partial name (using LIKE)
app.get('/accounts/search/:name', async (c) => {
  const name = `%${c.req.param('name')}%`; // Surround with wildcards for partial matching
  const data = await db
    .select()
    .from(accounts)
    .where(like(accounts.name, name));

  if (data.length === 0) {
    return c.json({ error: 'No accounts match the search' }, 404);
  }

  return c.json({ data });
});

// Create a new account
app.post('/accounts', async (c) => {
  const body = await c.req.json();
  
  if (!body.name) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const result = await db.insert(accounts).values({
    name: body.name,
  });

  return c.json({ message: 'Account created', result }, 201);
});

// Update an account by ID
app.put('/accounts/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  if (!body.name) {
    return c.json({ error: 'Name is required' }, 400);
  }

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

// Delete accounts by name (useful for bulk delete)
app.delete('/accounts/name/:name', async (c) => {
  const name = c.req.param('name');
  
  const result = await db
    .delete(accounts)
    .where(eq(accounts.name, name));

  return c.json({ message: `Accounts with name '${name}' deleted`, result });
});

// Get accounts with both ID and name conditions
app.get('/accounts/filter/:id/:name', async (c) => {
  const id = c.req.param('id');
  const name = c.req.param('name');
  
  const data = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.name, name)));

  if (data.length === 0) {
    return c.json({ error: 'No account found matching both criteria' }, 404);
  }

  return c.json({ data });
});

export default app;
