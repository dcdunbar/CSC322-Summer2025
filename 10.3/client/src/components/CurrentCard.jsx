export default function CurrentCard({data, unitLabel='°'}){
  const cw = data?.current_weather;
  const isImperial = unitLabel === '°F';
  const wind = cw?.windspeed != null
    ? Math.round(isImperial ? (cw.windspeed * 0.621371) : cw.windspeed)
    : null;
  const windUnit = isImperial ? ' mph' : ' km/h';

  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Current</h3>
      {!cw ? <div className="small">No data yet.</div> : (
        <div className="row" style={{gap:16}}>
          <div style={{fontSize:36}}>{Math.round(cw.temperature)}{unitLabel}</div>
          <div className="small">
            <div>Wind: {wind}{windUnit}</div>
            <div>Dir: {cw.winddirection}{'\u00B0'}</div>
          </div>
        </div>
      )}
    </div>
  )
}
