import { useEffect, useMemo, useState } from 'react'
import { apiGet } from './api'
import ThemeWrapper from './components/ThemeWrapper'
import CurrentCard from './components/CurrentCard'
import HourlyStrip from './components/HourlyStrip'
import WeeklyGrid from './components/WeeklyGrid'
import Login from './components/Login'
import Register from './components/Register'
import PasswordChange from './components/PasswordChange'
import Settings from './components/Settings'
import Favorites from './components/Favorites'

export default function App(){
  const [lat,setLat]=useState('38.254')
  const [lon,setLon]=useState('-85.759')
  const [q,setQ]=useState('') // City or ZIP
  const [units,setUnits]=useState(localStorage.getItem('units')||'imperial')
  const [wx,setWx]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [token,setToken]=useState(localStorage.getItem('token')||'')
  const [view,setView]=useState('weather') // weather|login|register|settings|password

  const theme = useMemo(()=>{
    const code = wx?.data?.current_weather?.weathercode ?? 0
    if([0,1].includes(code)) return 'sunny'
    if([2,3].includes(code)) return 'cloudy'
    if([51,53,55,61,63,65,80,81,82].includes(code)) return 'rainy'
    if([71,73,75,77,85,86].includes(code)) return 'snowy'
    return 'cloudy'
  },[wx])

  async function loadWeather(l=lat, g=lon, u=units){
    setLoading(true); setError('')
    try{
      const data = await apiGet(`/api/weather?lat=${l}&lon=${g}&units=${u}`)
      setWx(data)
    }catch(e){ setError(e.message) } finally { setLoading(false) }
  }

  async function doSearch(){
    if(!q.trim()) return
    setError('')
    try{
      const g = await apiGet('/api/geocode?q=' + encodeURIComponent(q.trim()))
      setLat(String(g.lat)); setLon(String(g.lon))
      await loadWeather(String(g.lat), String(g.lon), units)
    }catch(e){ setError('Location not found') }
  }

  useEffect(()=>{ loadWeather() },[])
  useEffect(()=>{ if(lat&&lon) loadWeather(lat, lon, units) },[lat,lon,units])

  function onGeo(){
    if(!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(pos=>{
      const la = pos.coords.latitude.toFixed(3)
      const lo = pos.coords.longitude.toFixed(3)
      setLat(la); setLon(lo); loadWeather(la, lo, units)
    },()=>alert('Unable to get location'))
  }

  function doLogout(){ localStorage.removeItem('token'); setToken(''); setView('weather') }
  function applyPrefs(p){ if(p?.units){ setUnits(p.units); localStorage.setItem('units', p.units) } if(p?.default_lat && p?.default_lon){ setLat(String(p.default_lat)); setLon(String(p.default_lon)) } }
  const unitLabel = units === 'imperial' ? '°F' : '°C'

  // how many cards shown -> responsive grid class
  const gridClass = 'cards-grid ' + (token ? 'grid-4' : 'grid-3')

  return (
    <ThemeWrapper theme={theme}>
      <div className="container">
        <nav>
          <h1>Weather App</h1>
          <div className="row">
            <button onClick={()=>setView('weather')}>Weather</button>
            <button onClick={()=>setView('settings')}>Settings</button>
            {token && <button onClick={()=>setView('password')}>Password</button>}
            {!token && <button onClick={()=>setView('login')}>Login</button>}
            {!token && <button onClick={()=>setView('register')}>Register</button>}
            {token && <button onClick={doLogout}>Logout</button>}
          </div>
        </nav>

        <div className="card">
          <div className="row" style={{justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap'}}>
            <div className="row" style={{gap:8, flexWrap:'wrap'}}>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="City or ZIP" style={{minWidth:220}}/>
              <button onClick={doSearch}>Search</button>
              <button onClick={onGeo}>Use My Location</button>
              <button onClick={()=>loadWeather()}>Refresh</button>
            </div>
            <div className="row" style={{gap:8, alignItems:'center'}}>
              <select value={units} onChange={e=>{ setUnits(e.target.value); localStorage.setItem('units',e.target.value) }}>
                <option value="imperial">°F</option>
                <option value="metric">°C</option>
              </select>
              <div className="small">Source: {wx?.source || '-'}</div>
            </div>
          </div>
          {loading && <div className="small" style={{marginTop:6}}>Loading...</div>}
          {error && <div className="small" style={{color:'#ff9',marginTop:6}}>{error}</div>}
        </div>

        <div className={gridClass}>
          <CurrentCard data={wx?.data} unitLabel={unitLabel}/>
          <HourlyStrip data={wx?.data} unitLabel={unitLabel}/>
          <WeeklyGrid data={wx?.data} unitLabel={unitLabel}/>
          {token && <Favorites onPick={(la,lo)=>{ setLat(String(la)); setLon(String(lo)); setView('weather')}} />}
        </div>

        <div className="small" style={{marginTop:16}}>Final snapshot – Sep 4, 2025</div>
      </div>
    </ThemeWrapper>
  )
}
