import { useState } from 'react'
import { apiPost } from '../api'

export default function Login({ onLogin }){
  const [email,setEmail]=useState('test@example.com')
  const [password,setPassword]=useState('password123')
  const [error,setError]=useState('')
  async function submit(e){
    e.preventDefault()
    setError('')
    try{
      const res = await apiPost('/api/auth/login', {email, password})
      onLogin(res.token)
    }catch(err){ setError(err.message) }
  }
  return (
    <div className="card" style={{maxWidth:420}}>
      <h3 style={{marginTop:0}}>Login</h3>
      <form onSubmit={submit} className="row" style={{flexDirection:'column', gap:8}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"/>
        <button type="submit">Login</button>
      </form>
      {error && <div className="small" style={{color:'#ff9',marginTop:8}}>{error}</div>}
    </div>
  )
}
