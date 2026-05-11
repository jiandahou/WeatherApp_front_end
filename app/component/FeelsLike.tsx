import React from 'react'
import Image from 'next/image'

function FeelsLike({ apparent_temperature, temperature }:{apparent_temperature:number,temperature:number}) {
  const delta = apparent_temperature - temperature
  const normalized = Math.max(0, Math.min(1, (apparent_temperature + 20) / 60))

  let thermalBand = 'Comfortable'
  if (apparent_temperature < 0) thermalBand = 'Freezing'
  else if (apparent_temperature < 10) thermalBand = 'Chilly'
  else if (apparent_temperature < 18) thermalBand = 'Cool'
  else if (apparent_temperature < 27) thermalBand = 'Comfortable'
  else if (apparent_temperature < 33) thermalBand = 'Warm'
  else thermalBand = 'Hot'

  const statusTone =
    delta >= 3
      ? 'text-ui-state-warn'
      : delta <= -3
      ? 'text-ui-state-info'
      : 'text-ui-state-success'

  const statusText =
    delta >= 3
      ? `Feels warmer by ${Math.round(delta)}°`
      : delta <= -3
      ? `Feels cooler by ${Math.abs(Math.round(delta))}°`
      : 'Feels close to actual temperature'

  const barTone =
    apparent_temperature >= 33
      ? 'from-ui-state-danger to-ui-state-warn'
      : apparent_temperature >= 24
      ? 'from-ui-state-warn to-ui-accent'
      : apparent_temperature >= 12
      ? 'from-ui-state-info to-ui-state-success'
      : 'from-blue-400 to-ui-state-info'

  return (
    <div className='panel-surface-strong col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
      <div className='flex items-center gap-2'>
        <Image src="/ApparentTemperature.png" width={22} height={22} alt="Apparent Temperature" />
        <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Thermal Sense</span>
      </div>

      <div className='mt-3 flex items-end gap-2'>
        <span className='text-6xl font-semibold leading-none'>{Math.round(apparent_temperature)}</span>
        <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>c</span>
      </div>

      <div className='mt-1 flex items-center justify-between text-sm'>
        <span className={statusTone}>{statusText}</span>
        <span className='text-ui-text-3'>{thermalBand}</span>
      </div>

      <div className='mt-4'>
        <div className='h-2 w-full overflow-hidden rounded-full bg-ui-overlay-strong/55'>
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barTone} transition-[width] duration-700 ease-out`}
            style={{ width: `${(normalized * 100).toFixed(1)}%` }}
          />
        </div>
        <div className='mt-2 flex justify-between text-[11px] tracking-[0.14em] text-ui-text-3'>
          <span>cold</span>
          <span>mild</span>
          <span>hot</span>
        </div>
      </div>
    </div>
  )
}

export default FeelsLike
