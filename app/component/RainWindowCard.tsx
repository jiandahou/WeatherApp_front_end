import Image from 'next/image'

function RainWindowCard({
  precipitationHours,
  precipitationSum,
  precipitationProbabilityMax,
}: {
  precipitationHours: number
  precipitationSum: number
  precipitationProbabilityMax: number
}) {
  const hours = Math.max(0, precipitationHours)
  const amount = Math.max(0, precipitationSum)
  const probability = Math.max(0, Math.min(100, precipitationProbabilityMax))

  let status = 'Low rain risk'
  let tone = 'text-ui-state-success'
  if (probability >= 70 || amount >= 10) {
    status = 'Likely rain window'
    tone = 'text-ui-state-warn'
  } else if (probability >= 40 || amount >= 3) {
    status = 'Possible showers'
    tone = 'text-ui-state-info'
  }

  const barWidth = Math.max((probability / 100) * 100, Math.min(100, (hours / 12) * 100))
  
  // Water cup visualization: max capacity is 50mm
  const waterFillPercent = Math.min((amount / 50) * 100, 100)

  return (
    <div className='weather-metric-card col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Image src='/Rainsum.png' width={22} height={22} alt='Rain Window' loading="eager" />
          <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Rain Window</span>
        </div>
        
        {/* Water Cup SVG */}
        <svg width='60' height='80' viewBox='0 0 60 80' className='mx-2'>
          {/* Cup body */}
          <path
            d='M 15 15 L 18 70 Q 18 75 23 75 L 37 75 Q 42 75 42 70 L 45 15 Z'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            opacity='0.6'
          />
          {/* Cup rim */}
          <ellipse cx='30' cy='15' rx='15' ry='4' fill='none' stroke='currentColor' strokeWidth='1.5' opacity='0.6' />
          
          {/* Water inside */}
          <defs>
            <clipPath id='cupClip'>
              <path d='M 15 15 L 18 70 Q 18 75 23 75 L 37 75 Q 42 75 42 70 L 45 15 Z' />
            </clipPath>
          </defs>
          <rect
            x='15'
            y={70 - (waterFillPercent * 55) / 100}
            width='30'
            height={(waterFillPercent * 55) / 100}
            fill='url(#rainGradient)'
            clipPath='url(#cupClip)'
            className='transition-all duration-700'
          />
          <defs>
            <linearGradient id='rainGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='#60a5fa' stopOpacity='0.8' />
              <stop offset='100%' stopColor='#0369a1' stopOpacity='1' />
            </linearGradient>
          </defs>
          
          {/* Water amount label */}
          <text
            x='30'
            y='55'
            textAnchor='middle'
            fontSize='10'
            fill='currentColor'
            opacity='0.7'
            className='font-semibold'
          >
            {amount.toFixed(1)}
          </text>
        </svg>
      </div>

      <div className='mt-3 flex items-end gap-2'>
        <span className='text-6xl font-semibold leading-none'>{hours.toFixed(1)}</span>
        <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>h</span>
      </div>

      <div className='mt-1 flex items-center justify-between text-sm'>
        <span className={`font-medium ${tone}`}>{status}</span>
        <span className='text-ui-text-3'>{probability}% chance</span>
      </div>

      <div className='mt-4'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-ui-overlay-strong/55'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 transition-[width] duration-700 ease-out'
            style={{ width: `${barWidth.toFixed(1)}%` }}
          />
        </div>
        <div className='mt-2 flex items-center justify-between text-xs text-ui-text-2'>
          <span>{amount.toFixed(1)} mm total</span>
          <span>{hours.toFixed(1)} h wet</span>
        </div>
      </div>
    </div>
  )
}

export default RainWindowCard
