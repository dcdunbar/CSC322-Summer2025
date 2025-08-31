export default function WeeklyGrid({data}){
  const d = data?.daily;
  if(!d) return <div className="card"><h3 style={{marginTop:0}}>Weekly</h3><div className="small">No data yet.</div></div>;
  const days = d.time.map((t,i)=>({
    date: new Date(t).toLocaleDateString([], {weekday:'short', month:'numeric', day:'numeric'}),
    min: Math.round(d.temperature_2m_min[i]),
    max: Math.round(d.temperature_2m_max[i]),
    pr: Math.round((d.precipitation_sum?.[i] ?? 0))
  }));
  return (
    <div className="card">
      <h3 style={{marginTop:0}}>7‑Day Forecast</h3>
      <div className="grid">
        {days.map((x,idx)=>(
          <div key={idx} className="card" style={{padding:'8px 10px'}}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <div>{x.date}</div>
              <div className="small">Rain: {x.pr}mm</div>
            </div>
            <div style={{fontSize:22, marginTop:6}}>{x.max}° / <span className="small">{x.min}°</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
