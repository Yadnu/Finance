import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { accounts } from '@/db/schema';
import { eq, and, or, like, gt, lt, asc, desc } from 'drizzle-orm';  // More query operators

const app = new Hono();

// Get accounts with sorting by name or id
app.get('/accounts/sort', async (c) => {
  const sortField = c.req.query('field') || 'name';  // Default to 'name'
  const sortOrder = c.req.query('order') || 'asc';   // Default to ascending order

  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    .orderBy(sortOrder === 'asc' ? asc(accounts[sortField]) : desc(accounts[sortField]));

  return c.json({ data });
});

// Get accounts with filters (e.g., ID > 5 or name contains 'john')
app.get('/accounts/filter', async (c) => {
  const idFilter = c.req.query('id') ? gt(accounts.id, parseInt(c.req.query('id'))) : undefined;
  const nameFilter = c.req.query('name') ? like(accounts.name, `%${c.req.query('name')}%`) : undefined;

  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    .where(or(idFilter, nameFilter));

  return c.json({ data });
});

// Update only the 'name' of an account by ID
app.patch('/accounts/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  if (!body.name) {
    return c.json({ error: 'Name is required to update' }, 400);
  }

  const result = await db
    .update(accounts)
    .set({ name: body.name })
    .where(eq(accounts.id, id));

  return c.json({ message: 'Account name updated', result });
});

// Get accounts created after a specific ID (e.g., pagination or filtering by ID)
app.get('/accounts/after/:id', async (c) => {
  const id = c.req.param('id');
  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    .where(gt(accounts.id, id));

  return c.json({ data });
});

// Get accounts within a range of IDs (e.g., from 5 to 10)
app.get('/accounts/range', async (c) => {
  const minId = parseInt(c.req.query('minId') || '0');
  const maxId = parseInt(c.req.query('maxId') || '100');

  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    .where(and(gt(accounts.id, minId), lt(accounts.id, maxId)));

  return c.json({ data });
});

// Get account statistics (e.g., count of accounts)
app.get('/accounts/stats', async (c) => {
  const count = await db
    .select({ count: db.fn.count(accounts.id) })
    .from(accounts);

  return c.json({ totalAccounts: count[0].count });
});

// Get the latest created account (order by ID descending)
app.get('/accounts/latest', async (c) => {
  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    .orderBy(desc(accounts.id))
    .limit(1);

  if (data.length === 0) {
    return c.json({ error: 'No accounts found' }, 404);
  }

  return c.json({ data: data[0] });
});

// Get accounts with a combination of conditions (e.g., name contains 'john' AND ID > 10)
app.get('/accounts/complex-filter', async (c) => {
  const name = `%${c.req.query('name')}%`; // Partial match for name
  const id = parseInt(c.req.query('id') || '0'); // Filter by ID greater than provided value

  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    .where(and(like(accounts.name, name), gt(accounts.id, id)));

  if (data.length === 0) {
    return c.json({ error: 'No matching accounts found' }, 404);
  }

  return c.json({ data });
});

export default app;
