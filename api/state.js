const crypto = require('crypto');
const { neon } = require('@neondatabase/serverless');

const RECORD_ID = 'andrin';

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!process.env.DATABASE_URL || !process.env.HOME_SYNC_TOKEN) {
    return res.status(503).json({ error: 'cloud_not_configured' });
  }

  const auth = String(req.headers.authorization || '');
  const suppliedToken = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!safeEqual(suppliedToken, process.env.HOME_SYNC_TOKEN)) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT data, updated_at
        FROM public.homeoffice_state
        WHERE id = ${RECORD_ID}
        LIMIT 1
      `;

      if (!rows.length) {
        return res.status(404).json({ error: 'not_found' });
      }

      return res.status(200).json({
        data: rows[0].data,
        updatedAt: rows[0].updated_at
      });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);

      if (!body || typeof body !== 'object' || !('main' in body) || !('sidequests' in body)) {
        return res.status(400).json({ error: 'invalid_payload' });
      }

      const payload = JSON.stringify({
        main: body.main ?? null,
        sidequests: body.sidequests ?? null,
        clientUpdatedAt: Number(body.clientUpdatedAt) || Date.now()
      });

      const rows = await sql`
        INSERT INTO public.homeoffice_state (id, data, updated_at)
        VALUES (${RECORD_ID}, ${payload}::jsonb, now())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = now()
        RETURNING updated_at
      `;

      return res.status(200).json({
        ok: true,
        updatedAt: rows[0].updated_at
      });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error) {
    console.error('HomeOffice Neon sync failed:', error);
    return res.status(500).json({ error: 'database_error' });
  }
};
