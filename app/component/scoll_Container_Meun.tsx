"use client"
import LocationNavButtonPanel from "./location_NavButton_panel";
import {useCallback, useEffect, useRef, useState } from 'react';
import { motion } from "motion/react"
import Image from 'next/image';

export default function ScollContainerMeun(){
        var panelref=useRef<HTMLDivElement>(null);
        var [buttonIndex,setbuttonindex]=useState<number>(0)
        const [atRight, setAtRight] = useState(false)
        var [ButtonNumber,setButtonNumber]=useState<number>(0)
        const updateButtonCount = useCallback(() => {
            const list = panelref.current?.getElementsByTagName("button") ?? [];
            setButtonNumber(list.length);
          }, []);
          useEffect(() => {
            updateButtonCount();
            const el = panelref.current;
            if (!el) return;
            const mo = new MutationObserver(() => {
              updateButtonCount();
            });
            mo.observe(el, { childList: true });
            return () => mo.disconnect();
          }, [updateButtonCount]);
        
          useEffect(() => {
            const el = panelref.current;
            if (!el) return;
            const buttons = el.getElementsByTagName("button");
            if (!buttons.length) return;
            const last = buttons[buttons.length - 1];
            const io = new IntersectionObserver(
              ([entry]) => (setAtRight(entry.intersectionRatio === 1)),
              {  threshold: 1 }
            );
            io.observe(last);
            return () => io.disconnect();
          }, [ButtonNumber]);
        
          function turnLeft() {
            if (buttonIndex <= 0) return;
            setbuttonindex(i => i - 1);
            panelref.current!
              .getElementsByTagName("button")
              [buttonIndex - 1].scrollIntoView({ inline: "start", block: "nearest",behavior: "smooth" });
          }
        
          function turnRight() {
            if (buttonIndex >= ButtonNumber - 1 || atRight) return;
            setbuttonindex(i => i + 1);
            panelref.current!
              .getElementsByTagName("button")
              [buttonIndex + 1].scrollIntoView({ inline: "start", block: "nearest",behavior: "smooth" });
          }
    return(
        <div className="flex items-center sm:ml-2 sm:grow shrink sm:w-0 mt-2">
            <motion.button
                whileHover={{scale:1.1}}
                whileTap={{scale:0.8}}
                aria-label="Scroll left"
                onClick={turnLeft}
                className="
                w-8 h-8 sm:w-10 sm:h-10  mx-2 flex-none
                flex items-center justify-center
                bg-white/50 backdrop-blur-sm
                rounded-full
                shadow-md
                hover:bg-white/70
                active:bg-white
                transition-colors duration-200 ease-in-out
                "
            >
                <Image src="/leftarrow.svg" alt="Left arrow" className="sm:w-5 sm:h-5" width={20} height={20}/>
            </motion.button>
            <LocationNavButtonPanel  ref={panelref} />
            <motion.button
                whileHover={{scale:1.1}}
                whileTap={{scale:0.8}}
                aria-label="Scroll right"
                onClick={turnRight}
                className="
                w-8 h-8 sm:w-10 sm:h-10  mx-2 flex-none
                flex items-center justify-center
                bg-white/50 backdrop-blur-sm
                rounded-full
                shadow-md
                hover:bg-white/70
                active:bg-white
                transition-colors duration-200 ease-in-out
                "
            >
                <Image src="/rightarrow.svg" alt="Right arrow" className="sm:w-5 sm:h-5" width={20} height={20}/>
            </motion.button>
        </div>
    )
}