import React from 'react'

function Pressure({Pressure}:{Pressure:number}) {
    let pressureStatus;
    let color;
    let description;
  
    if (Pressure > 1010) {
      pressureStatus = 'High Pressure';
      color = 'text-red-600';
      description = 'High pressure often indicates good weather with clear skies. It can lead to dry conditions and is generally associated with anticyclones.';
    } else if (Pressure >= 990 && Pressure <= 1010) {
      pressureStatus = 'Normal Pressure';
      color = 'text-green-600';
      description = 'Normal pressure is typically associated with stable and mild weather. It usually does not indicate any significant changes in weather patterns.';
    } else {
      pressureStatus = 'Low Pressure';
      color = 'text-blue-600';
      description = 'Low pressure often indicates bad weather with rain, clouds, and storms. It is usually associated with cyclones and can bring precipitation and strong winds.';
    }
  
  return (
    <div className='flex col-span-12 sm:col-span-6 rounded-lg bg-white/80 border-2 border-sky-200/80 flex-col items-center justify-between flex-1'>
    <div className='flex'>
      <img src="Pressure.png" width={25} height={25} alt="Pressure.png" />
      <span className='text-lg'>Pressure</span>
    </div>
    <div className='w-max'>
      <span className='text-8xl'>{Math.round(Pressure)}</span>
    </div>
    <div className=' text-base w-max flex'>hPa</div>
    <div className={'text-lg '+color}>{pressureStatus}</div>
    <div className=' text-base'>{description}</div>
    </div>
  )
}

export default Pressure