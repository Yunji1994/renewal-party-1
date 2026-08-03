/*
  Simple Cloudflare Worker API to accept RSVPs and store them in D1.
  - POST /rsvp  -> insert RSVP
  - GET /rsvps -> list RSVPs (requires ADMIN_TOKEN header x-admin-token)

  Bindings expected in wrangler.toml:
  - D1 database bound as "DB"
  - R2 bucket bound as "IMAGES" (optional for listing/serving)
  - secret ADMIN_TOKEN
*/

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, {status:204, headers: corsHeaders()});
    }

    try {
      if (request.method === 'POST' && url.pathname === '/rsvp') {
        const data = await request.json();
        // basic validation
        if (!data.name) return json({error:'name required'}, 400);

        const created_at = new Date().toISOString();
        const stmt = env.DB.prepare(
          'INSERT INTO rsvps (name, email, attending, plus_one, dietary_restrictions, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        await stmt.bind(
          data.name,
          data.email,
          data.attending || 'no',
          data.plus_one || 'no',
          data.dietary_restrictions || '',
          data.message || '',
          created_at
        ).run();
        return json({ok:true}, 201);
      }

      if (request.method === 'GET' && url.pathname === '/rsvps') {
        const res = await env.DB.prepare('SELECT * FROM rsvps ORDER BY created_at DESC').all();
        return json({rows: res.results || res.rows || []});
      }

      return json({error: 'Not found'}, 404);
    } catch (err) {
      console.error(err);
      return json({error: String(err)}, 500);
    }
  }
}

function json(obj, status=200){
  return new Response(JSON.stringify(obj), {status, headers: {...corsHeaders(), 'Content-Type':'application/json'}});
}

function corsHeaders(){
  return {
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods':'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type, x-admin-token'
  };
}
