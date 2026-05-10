import React, { useEffect } from 'react';
import anime from 'animejs';
import Image from 'next/image';
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
    <div className='panel-surface-strong col-span-12 md:col-span-6 xl:col-span-3 rounded-2xl border border-ui-stroke-soft/20 p-4 sm:p-5 text-ui-text-1'>
      <div className='flex items-center gap-2'>
        <Image src="/ApparentTemperature.png" width={22} height={22} alt="Apparent Temperature" />
        <span className='text-xs uppercase tracking-[0.28em] text-ui-text-3'>Thermal Sense</span>
      </div>
      <div className='mt-3 flex items-end gap-2'>
        <span className='text-6xl font-semibold leading-none'>{Math.round(apparent_temperature)}</span>
        <span className='pb-1 text-sm uppercase tracking-[0.2em] text-ui-text-2'>celsius</span>
      </div>
      <div className='mt-1 text-sm text-ui-text-2'>Delta {Math.round(apparent_temperature - temperature)}° from actual</div>
      <div className='transition-all mt-4 mx-auto w-max'>
        <svg viewBox="0 0 15 30" width="50" height="100">
          <defs>
            <clipPath id="clip">
              <rect x="0" y="3" width="15" height="30"></rect>
            </clipPath>
          </defs>
          <g stroke="hsl(var(--ui-text-3))" fill="none" strokeWidth="1" strokeLinecap="round" transform="translate(7.5 0)">
            <path d="M 0 2.5 h 7"></path>
            <path d="M 0 5.5 h 5"></path>
            <path d="M 0 8.5 h 5"></path>
            <path d="M 0 11.5 h 7"></path>
            <path d="M 0 14.5 h 5"></path>
            <path d="M 0 17.5 h 5"></path>
          </g>
          <g clipPath="url(#clip)" stroke="hsl(var(--ui-state-danger))" fill="none" strokeWidth="1" strokeLinecap="round" transform="translate(7.5 0)">
            <path d="M 0 2.5 h 7"></path>
            <path d="M 0 5.5 h 5"></path>
            <path d="M 0 8.5 h 5"></path>
            <path d="M 0 11.5 h 7"></path>
            <path d="M 0 14.5 h 5"></path>
            <path d="M 0 17.5 h 5"></path>
          </g>
          <g>
            <path d="M 7.5 2.5 v 20" fill="none" stroke="hsl(var(--ui-text-1))" strokeWidth="5" strokeLinecap="round"></path>
            <circle cx="7.5" cy="25" r="5" fill="hsl(var(--ui-text-1))"></circle>
          </g>
          <path d="M 7.5 2.5 v 20" fill="none" stroke="hsl(var(--ui-overlay-strong))" strokeWidth="2" strokeLinecap="round" opacity="0.4"></path>
          <g>
            <g clipPath="url(#clip)">
              <path d="M 7.5 2.5 v 20" fill="none" stroke="hsl(var(--ui-state-danger))" strokeWidth="2" strokeLinecap="round"></path>
            </g>
            <circle cx="7.5" cy="25" r="3" fill="hsl(var(--ui-state-danger))"></circle>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default FeelsLike;
