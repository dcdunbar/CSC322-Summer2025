import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '../api'
export default function Favorites({ onPick }){
  const [items,setItems]=useState([])
  const [name,setName]=useState('')
  const [lat,setLat]=useState('')
  const [lon,setLon]=useState('')
  const [err,setErr]=useState('')
  async function load(){ try{ setItems(await apiGet('/api/user/favorites')) }catch{} }
  useEffect(()=>{ load() },[])
  async function add(e){ e.preventDefault(); setErr(''); try{ const r = await apiPost('/api/user/favorites',{ name, lat: parseFloat(lat), lon: parseFloat(lon) }); setName(''); setLat(''); setLon(''); setItems([r,...items]) }catch(e){ setErr(e.message) } }
  async function del(id){ try{ await apiDelete('/api/user/favorites/'+id); setItems(items.filter(x=>x.id!==id)) }catch(e){ setErr(e.message) } }
  return (<div className='card'><h3 style={{marginTop:0}}>Favorites</h3><form onSubmit={add} className='row' style={{gap:8,flexWrap:'wrap'}}><input placeholder='Name (e.g., Home)' value={name} onChange={e=>setName(e.target.value)} style={{minWidth:160}} required/><input placeholder='lat' value={lat} onChange={e=>setLat(e.target.value)} style={{width:120}} required/><input placeholder='lon' value={lon} onChange={e=>setLon(e.target.value)} style={{width:120}} required/><button type='submit'>Add</button></form>{err && <div className='small' style={{color:'#ff9',marginTop:8}}>{err}</div>}<div className='grid' style={{marginTop:8}}>{items.map(i=>(<div key={i.id} className='card' style={{padding:'8px 10px'}}><div className='row' style={{justifyContent:'space-between'}}><strong>{i.name}</strong><div className='row' style={{gap:6}}><button onClick={()=>onPick && onPick(i.lat, i.lon)}>Load</button><button onClick={()=>del(i.id)}>Delete</button></div></div><div className='small'>{i.lat}, {i.lon}</div></div>))}{!items.length && <div className='small'>No favorites yet.</div>}</div></div>)
}
