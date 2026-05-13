"use client"
import LocationNavButtonPanel from "./location_NavButton_panel";
import {useCallback, useRef } from 'react';
import { motion } from "motion/react"

export default function ScollContainerMeun(){
  var panelref=useRef<HTMLDivElement>(null);
          const getButtons = useCallback(() => {
            return Array.from(panelref.current?.getElementsByTagName("button") ?? []);
          }, []);

          const getViewport = useCallback(() => {
            return panelref.current?.parentElement as HTMLDivElement | null;
          }, []);

          const getCurrentIndex = useCallback(() => {
            const viewport = getViewport();
            const buttons = getButtons();
            if (!viewport || !buttons.length) return 0;

            const viewportLeft = viewport.getBoundingClientRect().left;
            let currentIndex = 0;
            let minDistance = Number.POSITIVE_INFINITY;

            buttons.forEach((button, index) => {
              const distance = Math.abs(button.getBoundingClientRect().left - viewportLeft);
              if (distance < minDistance) {
                minDistance = distance;
                currentIndex = index;
              }
            });

            return currentIndex;
          }, [getButtons, getViewport]);
        
          function turnLeft() {
            const buttons = getButtons();
            if (!buttons.length) return;
            const currentIndex = getCurrentIndex();
            const targetIndex = Math.max(currentIndex - 1, 0);
            if (targetIndex === currentIndex) return;
            buttons[targetIndex].scrollIntoView({ inline: "start", block: "nearest",behavior: "smooth" });
          }
        
          function turnRight() {
            const buttons = getButtons();
            if (!buttons.length) return;
            const currentIndex = getCurrentIndex();
            const targetIndex = Math.min(currentIndex + 1, buttons.length - 1);
            if (targetIndex === currentIndex) return;
            buttons[targetIndex].scrollIntoView({ inline: "start", block: "nearest",behavior: "smooth" });
          }
    return(
      <div className="flex w-full items-center sm:ml-2 sm:flex-1 sm:min-w-0">
            <motion.button
                whileHover={{scale:1.1}}
                whileTap={{scale:0.8}}
                aria-label="Scroll left"
                onClick={turnLeft}
          className="mx-1 flex h-7 w-7 flex-none items-center justify-center rounded-full panel-surface-strong text-ui-text-1 transition-colors duration-200 ease-in-out hover:shadow-panelGlow sm:mx-2 sm:h-10 sm:w-10"
            >
                <svg viewBox="0 0 20 20" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12.5 4.5L7 10L12.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </motion.button>
            <div className="pl-0.5 sm:pl-2 flex-1 min-w-0">
              <LocationNavButtonPanel  ref={panelref} />
            </div>
            <motion.button
                whileHover={{scale:1.1}}
                whileTap={{scale:0.8}}
                aria-label="Scroll right"
                onClick={turnRight}
          className="mx-1 flex h-7 w-7 flex-none items-center justify-center rounded-full panel-surface-strong text-ui-text-1 transition-colors duration-200 ease-in-out hover:shadow-panelGlow sm:mx-2 sm:h-10 sm:w-10"
            >
                <svg viewBox="0 0 20 20" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M7.5 4.5L13 10L7.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </motion.button>
        </div>
    )
}