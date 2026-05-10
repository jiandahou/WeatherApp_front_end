import React from 'react'
import Image from 'next/image'
function Visibility({visibility}:{visibility:number}) {
    let visibilityStatus;
    let colorClass;
    let description;
  
    if (visibility > 10000) {
      visibilityStatus = 'Excellent Visibility';
      colorClass = 'text-ui-state-success';
      description = 'Visibility is excellent. You can see clearly for more than 10 kilometers. This is typical in clear weather with no obstructions.';
    } else if (visibility > 5000 && visibility <= 10000) {
      visibilityStatus = 'Good Visibility';
      colorClass = 'text-ui-state-info';
      description = 'Visibility is good. You can see up to 5-10 kilometers. This is common in fair weather conditions.';
    } else if (visibility > 1000 && visibility <= 5000) {
      visibilityStatus = 'Moderate Visibility';
      colorClass = 'text-ui-state-warn';
      description = 'Visibility is moderate. You can see up to 1-5 kilometers. This could be due to light fog, haze, or light rain.';
    } else {
      visibilityStatus = 'Poor Visibility';
      colorClass = 'text-ui-state-danger';
      description = 'Visibility is poor. You can see less than 1 kilometer. This is often due to heavy fog, heavy rain, or other obstructions.';
    }
  return (
    <div className='panel-surface-strong col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
    <div className='flex items-center gap-2'>
      <Image src="/Visibility.svg" width={22} height={22} alt="Visibility.png" />
      <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Sight Range</span>
    </div>
    <div className='mt-3 flex items-end gap-2'>
      <span className='text-6xl font-semibold leading-none'>{Math.round(visibility)}</span>
      <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>m</span>
    </div>
    <div className='mt-1'>
        <span className={`text-sm font-medium ${colorClass}`}>{visibilityStatus}</span>
    </div>
    <div className={`mt-2 text-xs leading-5 text-ui-text-2`}>{description}</div>
    </div>
  )
}

export default Visibility