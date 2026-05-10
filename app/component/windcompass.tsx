import Image from 'next/image'
import React from 'react'

 function Windcompass({
     windspeed,
     windDirection,
 }: {
     windspeed: number;
     windDirection: number;
 }) {
    function windDirectionInterpreter(number:number):string{
        if(number<90){
            return "NE"
        }
        else if(number<180){
            return "SE"
        }
        else if(number<270){
            return "SW"
        }
        else{
            return "NW"
        }
    }


  return (
    <div className='panel-surface-strong col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
        <div className='flex items-center gap-2'>
            <Image src="/Windspeed.png" alt='windspeed' width={22} height={22} />
            <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Wind Control</span>
        </div>
        <div className='mt-3 flex items-end gap-2'>
            <span className='text-6xl font-semibold leading-none'>{Math.round(windspeed)}</span>
            <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>km/h</span>
        </div>
        <div className='mt-1 text-sm text-ui-text-2'>Direction {windDirectionInterpreter(windDirection)}</div>
        <div className='relative mt-4 mx-auto w-max'>
            <Image src='/compass_body.svg' alt='compassbody' width={110} height={110}></Image>
            <Image src='/compass_arrow.svg' style={{
                transform:`rotate(${windDirection}deg)`
            }} alt='compassbody' className='absolute top-0 left-[47%] transition-all duration-500 ease-in-out rota' width={11} height={11}></Image> 
            <span className='absolute top-[39%] left-[40%] w-max text-xs text-ui-text-2'>{windDirectionInterpreter(windDirection)}</span>  
        </div>
    </div>
  )
}

export default Windcompass