import React from 'react'
import Image from 'next/image'

function Pressure({Pressure}:{Pressure:number}) {
  const delta = Math.round(Pressure - 1013)
  const normalized = Math.max(0, Math.min(1, (Pressure - 960) / 80))

  let pressureStatus = 'Normal pressure'
  let color = 'text-ui-state-success'
  let description = 'Stable atmosphere. Weather changes are usually gradual.'

  if (Pressure >= 1022) {
    pressureStatus = 'High pressure'
    color = 'text-ui-state-warn'
    description = 'Often linked to clearer skies and drier air.'
  } else if (Pressure <= 1006) {
    pressureStatus = 'Low pressure'
    color = 'text-ui-state-info'
    description = 'Higher chance of clouds, wind, or precipitation.'
  }
  
  return (
    <div className='panel-surface-strong col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
      <div className='flex items-center gap-2'>
        <Image src="/Pressure.png" width={22} height={22} alt="Pressure" />
        <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Barometric</span>
      </div>

      <div className='mt-3 flex items-end gap-2'>
        <span className='text-6xl font-semibold leading-none'>{Math.round(Pressure)}</span>
        <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>hpa</span>
      </div>

      <div className='mt-1 flex items-center justify-between text-sm'>
        <span className={`font-medium ${color}`}>{pressureStatus}</span>
        <span className='text-ui-text-3'>{delta >= 0 ? `+${delta}` : delta} vs std</span>
      </div>

      <div className='mt-4'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-ui-overlay-strong/55'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 transition-[width] duration-700 ease-out'
            style={{ width: `${(normalized * 100).toFixed(1)}%` }}
          />
        </div>
        <div className='mt-2 flex justify-between text-[11px] tracking-[0.14em] text-ui-text-3'>
          <span>960</span>
          <span>1013</span>
          <span>1040</span>
        </div>
      </div>

      <div className='mt-2 text-xs leading-5 text-ui-text-2'>{description}</div>
    </div>
  )
}

export default Pressure