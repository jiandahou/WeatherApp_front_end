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
      <div className="flex items-center sm:ml-2 sm:flex-1 sm:min-w-0">
            <motion.button
                whileHover={{scale:1.1}}
                whileTap={{scale:0.8}}
                aria-label="Scroll left"
                onClick={turnLeft}
          className="w-8 h-8 sm:w-10 sm:h-10 mx-2 flex-none flex items-center justify-center panel-surface-strong rounded-full transition-colors duration-200 ease-in-out text-white hover:shadow-panelGlow text-lg font-bold"
            >
                ◀
            </motion.button>
            <div className="pl-1 sm:pl-2 flex-1 min-w-0">
              <LocationNavButtonPanel  ref={panelref} />
            </div>
            <motion.button
                whileHover={{scale:1.1}}
                whileTap={{scale:0.8}}
                aria-label="Scroll right"
                onClick={turnRight}
          className="w-8 h-8 sm:w-10 sm:h-10 mx-2 flex-none flex items-center justify-center panel-surface-strong rounded-full transition-colors duration-200 ease-in-out text-white hover:shadow-panelGlow text-lg font-bold"
            >
                ▶
            </motion.button>
        </div>
    )
}