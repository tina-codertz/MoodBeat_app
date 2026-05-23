import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  userId: string;
  userEmail: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use('/api/*', cors());

// ── Password hashing with Web Crypto ──

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  const toHex = (buf: Uint8Array) =>
    [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${toHex(salt)}:${toHex(new Uint8Array(hash))}`;
}

async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((b) => parseInt(b, 16)),
  );
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  const computed = [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex === computed;
}

// ── Auth middleware (skip public routes) ──

app.use('/api/*', async (c, next) => {
  const path = c.req.path;
  if (path === '/api/auth/signin' || path === '/api/auth/signup') {
    return next();
  }

  // Songs endpoint is public for browsing without auth
  if (path === '/api/songs' && c.req.method === 'GET') {
    // Still try to extract user if token present, but don't require it
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = await verify(
          authHeader.slice(7),
          c.env.JWT_SECRET,
        );
        c.set('userId', payload.sub as string);
        c.set('userEmail', payload.email as string);
      } catch {
        // Token invalid but endpoint is public — continue
      }
    }
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const payload = await verify(authHeader.slice(7), c.env.JWT_SECRET);
    c.set('userId', payload.sub as string);
    c.set('userEmail', payload.email as string);
    return next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// ── Auth Routes ──

app.post('/api/auth/signup', async (c) => {
  const { email, password } = await c.req.json<{
    email: string;
    password: string;
  }>();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }
  if (password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400);
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?',
  )
    .bind(email.toLowerCase())
    .first();

  if (existing) {
    return c.json({ error: 'An account with this email already exists' }, 409);
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
  )
    .bind(id, email.toLowerCase(), passwordHash)
    .run();

  return c.json({ message: 'Account created successfully' }, 201);
});

app.post('/api/auth/signin', async (c) => {
  const { email, password } = await c.req.json<{
    email: string;
    password: string;
  }>();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT id, email, password_hash, created_at FROM users WHERE email = ?',
  )
    .bind(email.toLowerCase())
    .first<{ id: string; email: string; password_hash: string; created_at: string }>();

  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const token = await sign(
    { sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    c.env.JWT_SECRET,
  );

  return c.json({
    token,
    user: { id: user.id, email: user.email, created_at: user.created_at },
  });
});

app.get('/api/auth/me', async (c) => {
  const userId = c.get('userId');
  const user = await c.env.DB.prepare(
    'SELECT id, email, created_at FROM users WHERE id = ?',
  )
    .bind(userId)
    .first<{ id: string; email: string; created_at: string }>();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user });
});

// ── Songs Routes ──

app.get('/api/songs', async (c) => {
  const tagsParam = c.req.query('tags');

  if (tagsParam) {
    const tags = tagsParam.split(',').map((t) => t.trim()).filter(Boolean);
    if (tags.length === 0) {
      return c.json({ songs: [] });
    }

    const placeholders = tags.map(() => '?').join(',');
    const query = `
      SELECT DISTINCT s.* FROM songs s, json_each(s.mood_tags) AS t
      WHERE t.value IN (${placeholders})
      LIMIT 20
    `;
    const { results } = await c.env.DB.prepare(query).bind(...tags).all();
    const songs = (results || []).map(parseSongRow);
    return c.json({ songs });
  }

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM songs LIMIT 20',
  ).all();
  const songs = (results || []).map(parseSongRow);
  return c.json({ songs });
});

function parseSongRow(row: Record<string, unknown>) {
  return {
    ...row,
    mood_tags: JSON.parse((row.mood_tags as string) || '[]'),
  };
}

// ── Playlist Routes ──

app.get('/api/playlists', async (c) => {
  const userId = c.get('userId');
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC',
  )
    .bind(userId)
    .all();
  return c.json({ playlists: results || [] });
});

app.post('/api/playlists', async (c) => {
  const userId = c.get('userId');
  const { name, description, cover_gradient, song_ids } = await c.req.json<{
    name: string;
    description: string;
    cover_gradient: string;
    song_ids: string[];
  }>();

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO playlists (id, user_id, name, description, cover_gradient) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, userId, name, description || '', cover_gradient || '')
    .run();

  if (song_ids?.length) {
    const stmt = c.env.DB.prepare(
      'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
    );
    const batch = song_ids.map((sid, i) => stmt.bind(id, sid, i));
    await c.env.DB.batch(batch);
  }

  const playlist = await c.env.DB.prepare(
    'SELECT * FROM playlists WHERE id = ?',
  )
    .bind(id)
    .first();

  return c.json({ playlist }, 201);
});

app.delete('/api/playlists/:id', async (c) => {
  const userId = c.get('userId');
  const playlistId = c.req.param('id');

  await c.env.DB.prepare(
    'DELETE FROM playlists WHERE id = ? AND user_id = ?',
  )
    .bind(playlistId, userId)
    .run();

  return c.json({ ok: true });
});

app.get('/api/playlists/:id/songs', async (c) => {
  const userId = c.get('userId');
  const playlistId = c.req.param('id');

  // Verify ownership
  const playlist = await c.env.DB.prepare(
    'SELECT id FROM playlists WHERE id = ? AND user_id = ?',
  )
    .bind(playlistId, userId)
    .first();

  if (!playlist) {
    return c.json({ error: 'Playlist not found' }, 404);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT s.* FROM songs s
    JOIN playlist_songs ps ON ps.song_id = s.id
    WHERE ps.playlist_id = ?
    ORDER BY ps.position
  `)
    .bind(playlistId)
    .all();

  const songs = (results || []).map(parseSongRow);
  return c.json({ songs });
});

// ── Chat Routes ──

app.post('/api/chat/messages', async (c) => {
  const userId = c.get('userId');
  const { role, content } = await c.req.json<{
    role: string;
    content: string;
  }>();

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO chat_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)',
  )
    .bind(id, userId, role, content)
    .run();

  return c.json({ id }, 201);
});

export default app;
