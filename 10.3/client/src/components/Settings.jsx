import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../api'
export default function Settings({ onApply }){
  const [units,setUnits]=useState('imperial')
  const [lat,setLat]=useState('')
  const [lon,setLon]=useState('')
  const [msg,setMsg]=useState('')
  const [err,setErr]=useState('')
  useEffect(()=>{ (async()=>{ try{ const p = await apiGet('/api/user/prefs'); setUnits(p.units||'imperial'); setLat(p.default_lat ?? ''); setLon(p.default_lon ?? '') }catch{} })() },[])
  async function save(e){ e.preventDefault(); setMsg(''); setErr(''); try{ const p = await apiPut('/api/user/prefs',{units, default_lat: lat?parseFloat(lat):null, default_lon: lon?parseFloat(lon):null}); setUnits(p.units||'imperial'); setLat(p.default_lat ?? ''); setLon(p.default_lon ?? ''); setMsg('Preferences saved.'); onApply && onApply(p) }catch(e){ setErr(e.message) } }
  return (<div className='card' style={{maxWidth:520}}><h3 style={{marginTop:0}}>Settings</h3><form onSubmit={save} className='row' style={{flexDirection:'column',gap:8}}><label>Units</label><div className='row'><label><input type='radio' name='units' value='imperial' checked={units==='imperial'} onChange={()=>setUnits('imperial')}/> Â°F</label><label style={{marginLeft:12}}><input type='radio' name='units' value='metric' checked={units==='metric'} onChange={()=>setUnits('metric')}/> Â°C</label></div><label>Default Location (optional)</label><div className='row'><input placeholder='lat' value={lat} onChange={e=>setLat(e.target.value)} style={{width:120}}/><input placeholder='lon' value={lon} onChange={e=>setLon(e.target.value)} style={{width:120}}/></div><button type='submit'>Save</button></form>{msg && <div className='small' style={{color:'#9f9',marginTop:8}}>{msg}</div>}{err && <div className='small' style={{color:'#ff9',marginTop:8}}>{err}</div>}</div>)
}
