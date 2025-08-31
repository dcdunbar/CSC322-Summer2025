import { useEffect, useMemo, useState } from 'react'
import { apiGet } from './api'
import ThemeWrapper from './components/ThemeWrapper'
import CurrentCard from './components/CurrentCard'
import HourlyStrip from './components/HourlyStrip'
import WeeklyGrid from './components/WeeklyGrid'
import Login from './components/Login'
import Register from './components/Register'

export default function App(){
  const [lat,setLat]=useState('38.254')
  const [lon,setLon]=useState('-85.759')
  const [wx,setWx]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [token,setToken]=useState(localStorage.getItem('token')||'')
  const [view,setView]=useState('weather')

  const theme = useMemo(()=>{
    const code = wx?.data?.current_weather?.weathercode ?? 0
    if([0,1].includes(code)) return 'sunny'
    if([2,3].includes(code)) return 'cloudy'
    if([51,53,55,61,63,65,80,81,82].includes(code)) return 'rainy'
    if([71,73,75,77,85,86].includes(code)) return 'snowy'
    return 'cloudy'
  },[wx])

  async function loadWeather(){
    setLoading(true); setError('')
    try{
      const data = await apiGet(`/api/weather?lat=${lat}&lon=${lon}`)
      setWx(data)
    }catch(e){ setError(e.message) } finally { setLoading(false) }
  }

  useEffect(()=>{ loadWeather() },[])

  function onGeo(){
    if(!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(pos=>{
      setLat(pos.coords.latitude.toFixed(3))
      setLon(pos.coords.longitude.toFixed(3))
    },()=>alert('Unable to get location'))
  }

  useEffect(()=>{ if(lat&&lon) loadWeather() },[lat,lon])

  function doLogout(){
    localStorage.removeItem('token'); setToken(''); setView('weather')
  }

  return (
    <ThemeWrapper theme={theme}>
      <div className="container">
        <nav>
          <h1>Weather App</h1>
          <div className="row">
            <button onClick={()=>setView('weather')}>Weather</button>
            {!token && <button onClick={()=>setView('login')}>Login</button>}
            {!token && <button onClick={()=>setView('register')}>Register</button>}
            {token && <button onClick={doLogout}>Logout</button>}
          </div>
        </nav>

        {view==='weather' && (
          <div>
            <div className="card">
              <div className="row" style={{justifyContent:'space-between'}}>
                <div className="row">
                  <input value={lat} onChange={e=>setLat(e.target.value)} placeholder="lat" style={{width:120}}/>
                  <input value={lon} onChange={e=>setLon(e.target.value)} placeholder="lon" style={{width:120}}/>
                  <button onClick={loadWeather}>Refresh</button>
                  <button onClick={onGeo}>Use My Location</button>
                </div>
                <div className="small">Source: {wx?.source || '-'}</div>
              </div>
              {loading && <div className="small">Loading...</div>}
              {error && <div className="small" style={{color:'#ff9'}}>{error}</div>}
            </div>
            <div className="grid">
              <CurrentCard data={wx?.data}/>
              <HourlyStrip data={wx?.data}/>
              <WeeklyGrid data={wx?.data}/>
            </div>
          </div>
        )}

        {view==='login' && <Login onLogin={(tok)=>{localStorage.setItem('token',tok);setToken(tok);setView('weather')}}/>}
        {view==='register' && <Register onDone={()=>setView('login')}/>}

        <div className="small" style={{marginTop:16}}>Progress snapshot – Aug 30, 2025</div>
      </div>
    </ThemeWrapper>
  )
}
