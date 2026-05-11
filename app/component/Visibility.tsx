import React from 'react'
import Image from 'next/image'

function Visibility({visibility}:{visibility:number}) {
  const visibilityKm = visibility / 1000
  const normalized = Math.max(0, Math.min(1, visibility / 15000))

  let visibilityStatus = 'Excellent visibility'
  let colorClass = 'text-ui-state-success'
  let description = 'Clear horizon and low visual obstruction.'

  if (visibility < 1000) {
    visibilityStatus = 'Poor visibility'
    colorClass = 'text-ui-state-danger'
    description = 'Dense obstruction likely. Move cautiously outdoors.'
  } else if (visibility < 5000) {
    visibilityStatus = 'Moderate visibility'
    colorClass = 'text-ui-state-warn'
    description = 'Haze, mist, or light rain may limit distance.'
  } else if (visibility < 10000) {
    visibilityStatus = 'Good visibility'
    colorClass = 'text-ui-state-info'
    description = 'Most distant objects remain easy to distinguish.'
  }

  return (
    <div className='panel-surface-strong col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
      <div className='flex items-center gap-2'>
        <Image src="/Visibility.svg" width={22} height={22} alt="Visibility" />
        <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Sight Range</span>
      </div>

      <div className='mt-3 flex items-end gap-2'>
        <span className='text-6xl font-semibold leading-none'>{visibilityKm.toFixed(1)}</span>
        <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>km</span>
      </div>

      <div className='mt-1 flex items-center justify-between text-sm'>
        <span className={`font-medium ${colorClass}`}>{visibilityStatus}</span>
        <span className='text-ui-text-3'>{Math.round(visibility)} m</span>
      </div>

      <div className='mt-4'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-ui-overlay-strong/55'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-ui-state-danger via-ui-state-warn to-ui-state-success transition-[width] duration-700 ease-out'
            style={{ width: `${(normalized * 100).toFixed(1)}%` }}
          />
        </div>
        <div className='mt-2 flex justify-between text-[11px] tracking-[0.14em] text-ui-text-3'>
          <span>0km</span>
          <span>8km</span>
          <span>15km</span>
        </div>
      </div>

      <div className='mt-2 text-xs leading-5 text-ui-text-2'>{description}</div>
    </div>
  )
}

export default Visibility