import { useState } from 'react'
import { apiPost } from '../api'

export default function Register({ onDone }){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [ok,setOk]=useState(false)
  async function submit(e){
    e.preventDefault()
    setError('')
    try{
      await apiPost('/api/auth/register', {email, password})
      setOk(true)
      onDone && onDone()
    }catch(err){ setError(err.message) }
  }
  return (
    <div className="card" style={{maxWidth:420}}>
      <h3 style={{marginTop:0}}>Register</h3>
      <form onSubmit={submit} className="row" style={{flexDirection:'column', gap:8}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 8)" type="password"/>
        <button type="submit">Create Account</button>
      </form>
      {ok && <div className="small" style={{color:'#9f9',marginTop:8}}>Account created. You can log in now.</div>}
      {error && <div className="small" style={{color:'#ff9',marginTop:8}}>{error}</div>}
    </div>
  )
}
