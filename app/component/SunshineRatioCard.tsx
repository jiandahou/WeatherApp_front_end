import Image from 'next/image'

function SunshineRatioCard({
  sunshineDuration,
  daylightDuration,
}: {
  sunshineDuration: number
  daylightDuration: number
}) {
  const daylightHours = Math.max(0, daylightDuration) / 3600
  const sunshineHours = Math.max(0, sunshineDuration) / 3600
  const ratio = daylightHours > 0 ? Math.max(0, Math.min(1, sunshineHours / daylightHours)) : 0

  let status = 'Mostly cloudy day'
  let tone = 'text-ui-state-info'
  if (ratio >= 0.65) {
    status = 'Bright day'
    tone = 'text-ui-state-success'
  } else if (ratio >= 0.4) {
    status = 'Mixed sky'
    tone = 'text-ui-state-warn'
  }

  // Calculate shadow angle based on sun ratio (0% = long shadow, 100% = no shadow)
  const shadowAngle = (1 - ratio) * 45 // 0-45 degrees

  return (
    <div className='weather-metric-card col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Image src='/SunshineDuration.png' width={22} height={22} alt='Sunshine Ratio' loading="eager" />
          <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Sunshine Ratio</span>
        </div>
        
        {/* Sun & Shadow Visualization */}
        <svg width='70' height='70' viewBox='0 0 70 70' className='mx-2'>
          {/* Ground line */}
          <line x1='0' y1='50' x2='70' y2='50' stroke='currentColor' strokeWidth='1' opacity='0.3' />
          
          {/* Object (vertical stick) */}
          <line x1='35' y1='50' x2='35' y2='20' stroke='currentColor' strokeWidth='2' opacity='0.8' />
          
          {/* Shadow */}
          <line
            x1='35'
            y1='50'
            x2={35 + 25 * Math.cos((shadowAngle * Math.PI) / 180)}
            y2={50 - 25 * Math.sin((shadowAngle * Math.PI) / 180)}
            stroke='url(#shadowGradient)'
            strokeWidth='3'
            strokeLinecap='round'
            className='transition-all duration-700'
            opacity={Math.max(0.3, 1 - ratio * 0.7)}
          />
          
          {/* Sun */}
          <circle
            cx={55}
            cy={15 + (1 - ratio) * 10}
            r='5'
            fill='url(#sunGradient)'
            className='transition-all duration-700'
            opacity={ratio > 0 ? 1 : 0.3}
          />
          
          {/* Sun rays when sunny */}
          {ratio > 0.5 && (
            <>
              <line x1='55' y1='5' x2='55' y2='0' stroke='#fbbf24' strokeWidth='1.5' opacity='0.6' />
              <line x1='65' y1='15' x2='69' y2='15' stroke='#fbbf24' strokeWidth='1.5' opacity='0.6' />
              <line x1='61' y1='8' x2='64' y2='5' stroke='#fbbf24' strokeWidth='1.5' opacity='0.6' />
            </>
          )}
          
          <defs>
            <linearGradient id='sunGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor='#fef3c7' stopOpacity='1' />
              <stop offset='100%' stopColor='#fbbf24' stopOpacity='1' />
            </linearGradient>
            <linearGradient id='shadowGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor='#3f3f46' stopOpacity='0.6' />
              <stop offset='100%' stopColor='#18181b' stopOpacity='0.3' />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className='mt-3 flex items-end gap-2'>
        <span className='text-6xl font-semibold leading-none'>{Math.round(ratio * 100)}</span>
        <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>%</span>
      </div>

      <div className='mt-1 flex items-center justify-between text-sm'>
        <span className={`font-medium ${tone}`}>{status}</span>
        <span className='text-ui-text-3'>{sunshineHours.toFixed(1)}h sun</span>
      </div>

      <div className='mt-4'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-ui-overlay-strong/55'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-indigo-400 via-amber-400 to-yellow-300 transition-[width] duration-700 ease-out'
            style={{ width: `${(ratio * 100).toFixed(1)}%` }}
          />
        </div>
        <div className='mt-2 flex items-center justify-between text-xs text-ui-text-2'>
          <span>daylight {daylightHours.toFixed(1)}h</span>
          <span>sun {sunshineHours.toFixed(1)}h</span>
        </div>
      </div>
    </div>
  )
}

export default SunshineRatioCard
