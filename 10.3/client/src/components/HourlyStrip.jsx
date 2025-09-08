export default function HourlyStrip({data, unitLabel='Â°'}){
  const h = data?.hourly;
  if(!h) return <div className='card'><h3 style={{marginTop:0}}>Hourly</h3><div className='small'>No data yet.</div></div>;
  const rows = h.time.slice(0,24).map((t,i)=>({
    time: new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    temp: Math.round(h.temperature_2m[i]),
    pop: h.precipitation_probability?.[i] ?? 0
  }));
  return (
    <div className='card'>
      <h3 style={{marginTop:0}}>Next 24 Hours</h3>
      <div className='row' style={{overflowX:'auto', gap:10}}>
        {rows.map((r,idx)=>(
          <div key={idx} style={{minWidth:70,textAlign:'center'}}>
            <div className='small'>{r.time}</div>
            <div style={{fontSize:20}}>{r.temp}{unitLabel}</div>
            <div className='small'>{r.pop}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
