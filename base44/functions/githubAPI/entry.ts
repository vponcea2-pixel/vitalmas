import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const isAuthed = await base44.auth.isAuthenticated();
  if (!isAuthed) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body = {};
  try {
    const text = await req.text();
    if (text && text.trim().startsWith('{')) body = JSON.parse(text);
  } catch (_e) {}

  const url = new URL(req.url);
  const get = (k) => body[k] !== undefined ? body[k] : (url.searchParams.get(k) ?? '');
  const action = get('action');

  try {
    const conn = await base44.asServiceRole.connectors.getConnection('github');
    const accessToken = conn.accessToken;
    const ghHeaders = { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' };

    if (action === 'list_repos') {
      const res = await fetch('https://api.github.com/user/repos?per_page=50&sort=updated', { headers: ghHeaders });
      const data = await res.json();
      const repos = Array.isArray(data) ? data.map((r) => ({ full_name: r.full_name, owner: r.owner.login, name: r.name })) : [];
      return Response.json({ repos });
    }

    const owner = get('owner');
    const repo = get('repo');

    if (action === 'list_releases') {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=20`, { headers: ghHeaders });
      const data = await res.json();
      return Response.json({ releases: Array.isArray(data) ? data : [] });
    }

    if (action === 'create_release') {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        method: 'POST',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag_name: get('tag_name'),
          name: get('name'),
          body: get('body'),
          draft: get('draft') === true || get('draft') === 'true',
          prerelease: get('prerelease') === true || get('prerelease') === 'true'
        })
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data.message }, { status: res.status });
      return Response.json({ release: data });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});