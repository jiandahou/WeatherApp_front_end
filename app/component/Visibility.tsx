import React from 'react'

function Visibility({visibility}:{visibility:number}) {
    let visibilityStatus;
    let colorClass;
    let description;
  
    if (visibility > 10000) {
      visibilityStatus = 'Excellent Visibility';
      colorClass = 'text-green-600';
      description = 'Visibility is excellent. You can see clearly for more than 10 kilometers. This is typical in clear weather with no obstructions.';
    } else if (visibility > 5000 && visibility <= 10000) {
      visibilityStatus = 'Good Visibility';
      colorClass = 'text-blue-600';
      description = 'Visibility is good. You can see up to 5-10 kilometers. This is common in fair weather conditions.';
    } else if (visibility > 1000 && visibility <= 5000) {
      visibilityStatus = 'Moderate Visibility';
      colorClass = 'text-orange-600';
      description = 'Visibility is moderate. You can see up to 1-5 kilometers. This could be due to light fog, haze, or light rain.';
    } else {
      visibilityStatus = 'Poor Visibility';
      colorClass = 'text-red-600';
      description = 'Visibility is poor. You can see less than 1 kilometer. This is often due to heavy fog, heavy rain, or other obstructions.';
    }
  return (
    <div className='flex col-span-12 sm:col-span-6 rounded-lg bg-white/80 border-2 border-sky-200/80 flex-col items-center justify-between flex-1'>
    <div className='flex'>
      <img src="Visibility.svg" width={25} height={25} alt="Visibility.png" />
      <span className='text-lg'>Visibility</span>
    </div>
    <div className='w-max'>
      <span className='text-8xl'>{Math.round(visibility)}</span>
    </div>
    <div className=' text-base w-max flex'>meters</div>
    <div >
        <span className={`text-lg ${colorClass}`}>{visibilityStatus}</span>
    </div>
    <div className={`text-base w-max${colorClass}`}>{description}</div>
    </div>
  )
}

export default Visibility