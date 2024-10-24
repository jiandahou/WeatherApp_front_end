"use client"
import LocationNavButtonPanel from "./location_NavButton_panel";
import { MouseEventHandler, useEffect, useRef, useState } from 'react';
export default function ScollContainerMeun({LocationInfoList,onClick=()=>{}}:
    {LocationInfoList:Array<locationWeather>,
        onClick?:MouseEventHandler
    }){
        var [counterOfchange,setCounterOfchange]=useState<number>(0)
        var panelref=useRef<HTMLDivElement>(null);
        var [buttonIndex,setbuttonindex]=useState<number>(0)
        var buttonlist=useRef<HTMLCollectionOf<HTMLButtonElement>>()
        var ButtonNumber=useRef<number>(0)
        var maxButtonInPanel=useRef<number>(1)
        function updateButtonCount(){
            buttonlist.current=panelref.current!.getElementsByTagName("button")
            ButtonNumber.current=buttonlist.current!.length
            var style=window.getComputedStyle(buttonlist.current[0])
            var margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight)
            maxButtonInPanel.current=(panelref.current?.getBoundingClientRect().width!)/(buttonlist.current[0].getBoundingClientRect().width+margin)
            maxButtonInPanel.current=parseInt(maxButtonInPanel.current.toFixed(0))
        }
        useEffect(()=>{
            updateButtonCount(),
            window.addEventListener('resize',handleResize)
            return ()=>{window.removeEventListener("resize",handleResize)}
        },[])
        function handleResize(){
            updateButtonCount();
            setbuttonindex((prevButtonIndex) => {
                    if (prevButtonIndex + maxButtonInPanel.current > ButtonNumber.current) {
                        let index = (ButtonNumber.current - maxButtonInPanel.current >= 0) 
                            ? ButtonNumber.current - maxButtonInPanel.current 
                            : 0;
                        return index;
                    }
                    return prevButtonIndex;
                })

        }
        function turnleft(){
            updateButtonCount()
            if(buttonIndex<=0){
                return
            }
            else{
                setbuttonindex(buttonIndex-1)
                buttonlist.current![buttonIndex-1].scrollIntoView({block:"center",inline:"start"})
            }

        }
        function turnright(){
            updateButtonCount()
            if(buttonIndex>=ButtonNumber.current-maxButtonInPanel.current){
                return
            }
            else{
                setbuttonindex(buttonIndex+1)
                buttonlist.current![buttonIndex+1].scrollIntoView({block:"center",inline:"start"})
            }
        }
    return(
        <div className="flex sm:ml-2 sm:grow shrink sm:w-0">
            <LocationNavButtonPanel LocationInfoList={LocationInfoList}  ref={panelref} onClick={onClick} />
            <button aria-label="turn left" className="w-5 h-5 mx-2 shrink-0 " onClick={e=>turnleft()}>
                <img title="leftarrow" src="leftarrow.svg"></img>
            </button>
            <button aria-label="turn right" className="w-5 h-5 shrink-0" onClick={e=>turnright()}>
                <img title="rightarrow" src="rightarrow.svg"></img>
            </button>
        </div>
    )
}