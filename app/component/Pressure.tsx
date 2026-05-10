import React from 'react'
import Image from 'next/image'
function Pressure({Pressure}:{Pressure:number}) {
    let pressureStatus;
    let color;
    let description;
  
    if (Pressure > 1010) {
      pressureStatus = 'High Pressure';
      color = 'text-ui-state-warn';
      description = 'High pressure often indicates good weather with clear skies. It can lead to dry conditions and is generally associated with anticyclones.';
    } else if (Pressure >= 990 && Pressure <= 1010) {
      pressureStatus = 'Normal Pressure';
      color = 'text-ui-state-success';
      description = 'Normal pressure is typically associated with stable and mild weather. It usually does not indicate any significant changes in weather patterns.';
    } else {
      pressureStatus = 'Low Pressure';
      color = 'text-ui-state-info';
      description = 'Low pressure often indicates bad weather with rain, clouds, and storms. It is usually associated with cyclones and can bring precipitation and strong winds.';
    }
  
  return (
    <div className='panel-surface-strong col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
    <div className='flex items-center gap-2'>
      <Image src="/Pressure.png" width={22} height={22} alt="Pressure.png" />
      <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Barometric</span>
    </div>
    <div className='mt-3 flex items-end gap-2'>
      <span className='text-6xl font-semibold leading-none'>{Math.round(Pressure)}</span>
      <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>hpa</span>
    </div>
    <div className={'mt-1 text-sm font-medium '+color}>{pressureStatus}</div>
    <div className='mt-2 text-xs leading-5 text-ui-text-2'>{description}</div>
    </div>
  )
}

export default Pressure