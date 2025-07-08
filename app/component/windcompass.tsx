import Image from 'next/image'
import React from 'react'
import { useSelector } from 'react-redux'
import { selectWeatherinfo } from '../store/slice/weatherSlice'

 function Windcompass() {
    const weatherinfo=useSelector(selectWeatherinfo)
    const windspeed=weatherinfo!.daily.windSpeed10m
    const windDirection=weatherinfo!.daily.windDirection10m
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
    <div className='flex flex-1 col-span-12 sm:col-span-6 rounded-lg bg-white/80 border-2 border-sky-200/80 flex-col items-center justify-between'>
        <div className='flex'>
            <Image src="/Windspeed.png" alt='windspeed' width={25} height={25} />
            <span className='text-lg'>WindSpeed and Direction</span>
        </div>
        <div className=' text-8xl w-max'>{Math.round(windspeed)}</div>
        <div className=' text-base w-max'>KM/H</div>
        <div className='relative'>
            <Image src='/compass_body.svg' alt='compassbody' width={110} height={110}></Image>
            <Image src='/compass_arrow.svg' style={{
                transform:`rotate(${windDirection}deg)`
            }} alt='compassbody' className='absolute top-0 left-[47%] transition-all duration-500 ease-in-out rota' width={11} height={11}></Image> 
            <span className='absolute top-[39%] left-[40%] w-max'>{windDirectionInterpreter(windDirection)}</span>  
        </div>    
    </div>
  )
}

export default Windcompass