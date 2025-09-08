export default function ThemeWrapper({ theme="cloudy", children }){ return <div className={`theme-${theme}`}>{children}</div> }
