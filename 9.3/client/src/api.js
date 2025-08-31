export async function apiGet(path){
  const res = await fetch(path,{credentials:'same-origin'});
  if(!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}
export async function apiPost(path, body){
  const res = await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err.error||`POST ${path} failed: ${res.status}`)}
  return res.json();
}
