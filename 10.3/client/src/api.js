function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: 'Bearer ' + t } : {};
}

async function handle(res, method, path) {
  if (!res.ok) {
    let msg = '';
    try { const j = await res.json(); msg = j.error || ''; } catch {}
    throw new Error(method + ' ' + path + ' failed: ' + (msg || res.status));
  }
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(path, { headers: { ...authHeaders() }, credentials: 'same-origin' });
  return handle(res, 'GET', path);
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  });
  return handle(res, 'POST', path);
}

export async function apiPatch(path, body) {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  });
  return handle(res, 'PATCH', path);
}

export async function apiPut(path, body) {
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  });
  return handle(res, 'PUT', path);
}

export async function apiDelete(path) {
  const res = await fetch(path, { method: 'DELETE', headers: { ...authHeaders() } });
  return handle(res, 'DELETE', path);
}
