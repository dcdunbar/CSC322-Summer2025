export default function CurrentCard({data}){
  const cw = data?.current_weather;
  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Current</h3>
      {!cw ? <div className="small">No data yet.</div> : (
        <div className="row" style={{gap:16}}>
          <div style={{fontSize:36}}>{Math.round(cw.temperature)}°</div>
          <div className="small">
            <div>Wind: {Math.round(cw.windspeed)} m/s</div>
            <div>Dir: {cw.winddirection}°</div>
          </div>
        </div>
      )}
    </div>
  )
}
