import Image from 'next/image'

function DewPointCard({ dewPoint, temperature }: { dewPoint: number; temperature: number }) {
  const spread = Math.round(temperature - dewPoint)

  let status = 'Comfortable'
  let tone = 'text-ui-state-success'
  let description = 'Air should feel fairly dry and breathable.'

  if (dewPoint >= 20) {
    status = 'Muggy'
    tone = 'text-ui-state-warn'
    description = 'Noticeably sticky conditions likely.'
  } else if (dewPoint < 10) {
    status = 'Dry air'
    tone = 'text-ui-state-info'
    description = 'Crisp air with little moisture load.'
  }

  const normalized = Math.max(0, Math.min(1, (dewPoint + 10) / 35))
  
  // Condensation level: how close air is to dew point (lower spread = higher condensation)
  const condensationLevel = Math.max(0, Math.min(1, 1 - spread / 15))
  const waterDropCount = Math.ceil(condensationLevel * 8)

  return (
    <div className='panel-surface-strong col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Image src='/Fog.svg' width={22} height={22} alt='Dew Point' />
          <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Dew Point</span>
        </div>
        
        {/* Condensed glass cup visualization */}
        <svg width='65' height='75' viewBox='0 0 65 75' className='mx-2'>
          {/* Cup body */}
          <path
            d='M 12 12 L 15 65 Q 15 70 20 70 L 45 70 Q 50 70 50 65 L 53 12 Z'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
            opacity='0.6'
          />
          {/* Cup rim */}
          <ellipse cx='32.5' cy='12' rx='20.5' ry='4' fill='none' stroke='currentColor' strokeWidth='1.5' opacity='0.6' />
          
          {/* Frosted glass effect */}
          <rect x='12' y='12' width='41' height='58' fill='url(#frostedGlass)' opacity='0.08' />
          
          {/* Water droplets on glass - condensation */}
          {Array.from({ length: waterDropCount }).map((_, i) => {
            const positions = [
              { x: 18, y: 20 },
              { x: 45, y: 25 },
              { x: 22, y: 35 },
              { x: 42, y: 40 },
              { x: 20, y: 50 },
              { x: 44, y: 55 },
              { x: 25, y: 60 },
              { x: 40, y: 62 },
            ]
            const pos = positions[i % positions.length]
            return (
              <ellipse
                key={i}
                cx={pos.x}
                cy={pos.y}
                rx='2'
                ry='2.5'
                fill='#e0f2fe'
                opacity={condensationLevel > 0 ? 0.7 : 0.2}
                className='transition-all duration-700'
              />
            )
          })}
          
          <defs>
            <linearGradient id='frostedGlass' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor='#ffffff' stopOpacity='0.3' />
              <stop offset='100%' stopColor='#0369a1' stopOpacity='0.1' />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className='mt-3 flex items-end gap-2'>
        <span className='text-6xl font-semibold leading-none'>{Math.round(dewPoint)}</span>
        <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>c</span>
      </div>

      <div className='mt-1 flex items-center justify-between text-sm'>
        <span className={`font-medium ${tone}`}>{status}</span>
        <span className='text-ui-text-3'>spread {spread}deg</span>
      </div>

      <div className='mt-4'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-ui-overlay-strong/55'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-orange-400 transition-[width] duration-700 ease-out'
            style={{ width: `${(normalized * 100).toFixed(1)}%` }}
          />
        </div>
        <div className='mt-2 text-xs leading-5 text-ui-text-2'>{description}</div>
      </div>
    </div>
  )
}

export default DewPointCard
