import path from 'path';
import React, { useEffect } from 'react';
import anime from 'animejs';
function FeelsLike({ apparent_temperature, temperature }:{apparent_temperature:number,temperature:number}) {
    function animate(){
                // target the rectangle fabricating the clipPath element
        const clip = document.querySelector('svg #clip rect');
        // define a random amount of milliseconds for the animation
        const duration = 1000;
        const value=30-30*((apparent_temperature+50)/100)
        // describe the values assumed by the rectangle
        // translated vertically from its original position to 0 and then back slightly to hide more content
        const translate = [
        {
            value: 'translate(0 20)',
        },
        {
            value: 'translate(0 0)',
        },
        {
            value: `translate(0 ${value})`,
        },
        ];

        // animate the clip with the first two values
                anime({
                targets: clip,
                transform: translate.slice(0, 2),
                duration,
                easing: 'easeOutQuad',
                // when the animation is complete animate the clip with the latter two values, alternating indefinitely between the two
                complete: () => anime({
                    targets: clip,
                    transform: translate.slice(1),
                    direction: 'forwards',
                    //loop: true,
                    duration: duration / 1.5,
                    easing: 'easeInOutSine',
                }),
                });

    }
    useEffect(()=>{
        animate()
    },[apparent_temperature])
  return (
    <div className='flex col-span-12 sm:col-span-6 rounded-lg bg-white/80 border-2 border-sky-200/80 flex-col items-center justify-between flex-1'>
      <div className='flex'>
        <img src="ApparentTemperature.png" width={25} height={25} alt="Apparent Temperature" />
        <span className='text-lg'>Feels Like</span>
      </div>
      <div className=' w-max'>
        <span className='text-8xl'>{Math.round(apparent_temperature)}</span>
        <span className=' text-3xl align-top'>°</span>
      </div>
      <div className=' text-base w-max flex'>Celsius</div>
      <div className='transition-all'>
        <svg viewBox="0 0 15 30" width="50" height="100">
          <defs>
            <clipPath id="clip">
              <rect x="0" y="3" width="15" height="30"></rect>
            </clipPath>
          </defs>
          <g stroke="#272A6E" fill="none" strokeWidth="1" strokeLinecap="round" transform="translate(7.5 0)">
            <path d="M 0 2.5 h 7"></path>
            <path d="M 0 5.5 h 5"></path>
            <path d="M 0 8.5 h 5"></path>
            <path d="M 0 11.5 h 7"></path>
            <path d="M 0 14.5 h 5"></path>
            <path d="M 0 17.5 h 5"></path>
          </g>
          <g clipPath="url(#clip)" stroke="#FF4E2C" fill="none" strokeWidth="1" strokeLinecap="round" transform="translate(7.5 0)">
            <path d="M 0 2.5 h 7"></path>
            <path d="M 0 5.5 h 5"></path>
            <path d="M 0 8.5 h 5"></path>
            <path d="M 0 11.5 h 7"></path>
            <path d="M 0 14.5 h 5"></path>
            <path d="M 0 17.5 h 5"></path>
          </g>
          <g>
            <path d="M 7.5 2.5 v 20" fill="none" stroke="#F5F3E8" strokeWidth="5" strokeLinecap="round"></path>
            <circle cx="7.5" cy="25" r="5" fill="#F5F3E8"></circle>
          </g>
          <path d="M 7.5 2.5 v 20" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" opacity="0.2"></path>
          <g>
            <g clipPath="url(#clip)">
              <path d="M 7.5 2.5 v 20" fill="none" stroke="#FF4E2C" strokeWidth="2" strokeLinecap="round"></path>
            </g>
            <circle cx="7.5" cy="25" r="3" fill="#FF4E2C"></circle>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default FeelsLike;
