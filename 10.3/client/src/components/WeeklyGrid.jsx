export default function WeeklyGrid({data, unitLabel='°'}){
  const d = data?.daily;
  if(!d) return <div className="card"><h3 style={{marginTop:0}}>7-Day Forecast</h3><div className="small">No data yet.</div></div>;

  const pUnit = d.precipitation_unit || (unitLabel === '°F' ? 'in' : 'mm');

  function fmtDate(t){
    const dt = new Date(t);
    const wk = dt.toLocaleDateString(undefined, { weekday: 'short' });
    return wk + ' ' + (dt.getMonth()+1) + ' - ' + dt.getDate();
  }

  const days = d.time.map((t,i)=>({
    date: fmtDate(t),
    min: Math.round(d.temperature_2m_min[i]),
    max: Math.round(d.temperature_2m_max[i]),
    pr: d.precipitation_sum ? (pUnit === 'in' ? (Math.round(d.precipitation_sum[i]*100)/100) : Math.round(d.precipitation_sum[i])) : 0
  }));

  return (
    <div className="card">
      <h3 style={{marginTop:0}}>7-Day Forecast</h3>
      <div className="grid">
        {days.map((x,idx)=>(
          <div key={idx} className="card" style={{padding:'8px 10px'}}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <div>{x.date}</div>
              <div className="small">Rain: {x.pr}{pUnit}</div>
            </div>
            <div style={{fontSize:22, marginTop:6}}>
              {x.max}{unitLabel} · <span className="small">{x.min}{unitLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
