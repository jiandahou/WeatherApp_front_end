import Image from 'next/image'

function HumidityCard({ humidity }: { humidity: number }) {
  const clamped = Math.max(0, Math.min(100, humidity))

  let status = 'Comfortable'
  let tone = 'text-ui-state-success'
  let description = 'Air moisture feels balanced for most activities.'

  if (clamped < 35) {
    status = 'Dry'
    tone = 'text-ui-state-info'
    description = 'Low moisture may cause dry skin or throat.'
  } else if (clamped > 65) {
    status = 'Humid'
    tone = 'text-ui-state-warn'
    description = 'Air can feel sticky and warmer than actual.'
  }

  const moleculePositions = [
    { x: 12, y: 14 },
    { x: 26, y: 10 },
    { x: 43, y: 13 },
    { x: 56, y: 20 },
    { x: 18, y: 28 },
    { x: 34, y: 24 },
    { x: 50, y: 33 },
    { x: 10, y: 43 },
    { x: 28, y: 41 },
    { x: 44, y: 47 },
    { x: 58, y: 50 },
    { x: 20, y: 57 },
    { x: 36, y: 59 },
    { x: 52, y: 61 },
    { x: 7, y: 23 },
    { x: 62, y: 38 },
  ]
  const moleculeCount = moleculePositions.length
  const activeMolecules = Math.ceil((clamped / 100) * moleculeCount)
  const molecules = moleculePositions.map((position, i) => ({
    id: i,
    x: position.x,
    y: position.y,
    active: i < activeMolecules,
  }))

  return (
    <div className='weather-metric-card col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Image src='/Fog.svg' width={22} height={22} alt='Humidity' loading="eager" />
          <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Humidity</span>
        </div>

        {/* Water vapor molecules visualization */}
        <svg width='70' height='70' viewBox='0 0 70 70' className='mx-2'>
          {/* Background circle */}
          <circle cx='35' cy='35' r='33' fill='none' stroke='currentColor' strokeWidth='1' opacity='0.2' />

          {/* Water molecules */}
          {molecules.map((mol) => (
            <g key={mol.id}>
              {/* Molecule outer circle */}
              <circle
                cx={mol.x}
                cy={mol.y}
                r='2.5'
                fill={mol.active ? '#60a5fa' : 'currentColor'}
                opacity={mol.active ? 0.8 : 0.2}
                className='transition-all duration-700'
              />
              {/* Molecule inner dot for H2O representation */}
              {mol.active && (
                <circle cx={mol.x} cy={mol.y} r='1' fill='#0369a1' opacity='0.6' />
              )}
            </g>
          ))}

          {/* Center indicator */}
          <text
            x='35'
            y='38'
            textAnchor='middle'
            fontSize='9'
            fill='currentColor'
            fontWeight='600'
            opacity='0.5'
          >
            {`${activeMolecules}/${moleculeCount}`}
          </text>
        </svg>
      </div>

      <div className='mt-3 flex items-end gap-2'>
        <span className='text-6xl font-semibold leading-none'>{Math.round(clamped)}</span>
        <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>%</span>
      </div>

      <div className='mt-1 flex items-center justify-between text-sm'>
        <span className={`font-medium ${tone}`}>{status}</span>
        <span className='text-ui-text-3'>ideal 40-60%</span>
      </div>

      <div className='mt-4'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-ui-overlay-strong/55'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-cyan-300 transition-[width] duration-700 ease-out'
            style={{ width: `${clamped}%` }}
          />
        </div>
        <div className='mt-2 text-xs leading-5 text-ui-text-2'>{description}</div>
      </div>
    </div>
  )
}

export default HumidityCard
