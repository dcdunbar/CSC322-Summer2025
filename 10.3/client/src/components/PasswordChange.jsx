import { useState } from 'react'
import { apiPatch } from '../api'
export default function PasswordChange(){
  const [currentPassword,setCurrent]=useState('')
  const [newPassword,setNew]=useState('')
  const [msg,setMsg]=useState('')
  const [err,setErr]=useState('')
  async function submit(e){ e.preventDefault(); setMsg(''); setErr(''); try{ await apiPatch('/api/auth/password',{currentPassword,newPassword}); setMsg('Password updated.'); setCurrent(''); setNew('') }catch(e){ setErr(e.message) } }
  return (<div className='card' style={{maxWidth:460}}><h3 style={{marginTop:0}}>Change Password</h3><form onSubmit={submit} className='row' style={{flexDirection:'column',gap:8}}><input type='password' placeholder='Current password' value={currentPassword} onChange={e=>setCurrent(e.target.value)} required/><input type='password' placeholder='New password (min 8)' value={newPassword} onChange={e=>setNew(e.target.value)} required/><button type='submit'>Update Password</button></form>{msg && <div className='small' style={{color:'#9f9',marginTop:8}}>{msg}</div>}{err && <div className='small' style={{color:'#ff9',marginTop:8}}>{err}</div>}</div>)
}
