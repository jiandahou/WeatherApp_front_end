"use client"
import { useEffect, useMemo, useState } from 'react';
//changing the json to mysql request would be better choice 
import cities from '../cities.json';
import clsx from 'clsx';
import path from 'node:path';
export default function WeatherLocationSearchBar({onClick=(e:React.MouseEvent<HTMLButtonElement>)=>{}}){
    var [result,setResult]=useState([] as any[]);
    var [input,setInput]=useState("");
    const cityList = useMemo(() => Object.values(cities), []);
    type city={
        name:string ,
        lat: number,
        lng: number,
        country: string,
    }
    var openSearchbox=false
    function Checkresult(input:string){
        return cityList.filter((city=>city.name.toLowerCase().includes(input.toLowerCase())))
        .sort((s1:city,s2:city)=>{
                if(s1.name.toLowerCase().startsWith(input.toLowerCase()) &&!s2.name.toLowerCase().startsWith(input.toLowerCase())){
                    return -1
                }
                else if(!s1.name.toLowerCase().startsWith(input.toLowerCase()) &&s2.name.toLowerCase().startsWith(input.toLowerCase())){
                    return 1
                }
                else{
                    if(s1.name.toLowerCase().indexOf(input.toLowerCase())<s2.name.toLowerCase().indexOf(input.toLowerCase())){
                        return -1
                    }
                    else if(s1.name.toLowerCase().indexOf(input.toLowerCase())>s2.name.toLowerCase().indexOf(input.toLowerCase())){
                        return 1
                    }
                    return s1.name.localeCompare(s2.name,"en")
                }       
                })
}
    function loseFoucus(){
        setInput("");
        setResult([]);
    }
    function handleClickOutside(e:MouseEvent){
        const target=e.target as HTMLElement
        if(!target.closest('.search-container')){
            loseFoucus()
        }
    }
    if(result.length>5){
        setResult(result.slice(0,4))
    }
    openSearchbox=(input.length>0)?true:false
    useEffect(()=>{
        document.addEventListener('click', handleClickOutside);
        return ()=>{document.removeEventListener('click', handleClickOutside);
        }
    })
    console.log(result)
    return(
        <div className='sm:w-64 search-container shrink-0 space-y-4'>
            <div className="flex flex-row rounded-lg border-gray-400 relative ">
                <input type="text" placeholder="Searching for location" value={input} className="rounded-lg w-full" onChange={(e=>{setInput(e.target.value);setResult(Checkresult(e.target.value));if(!e.target.value){
                    loseFoucus()
                }})}></input>
                <img src="search-svgrepo-com.svg" alt="searchIcon" className='mx-4 absolute right-0  pointer-events-none size-4 bottom-1'></img>
                <ul className={clsx("bg-white/90 absolute top-6 rounded-lg z-20 w-full",{"hidden":!openSearchbox,"block":openSearchbox})}>
                    {result.map(result=><li key={result.name+result.lat} className='hover:bg-cyan-100'><button className='w-full rounded-lg text-left truncate' onClick={(e) => {onClick(e);loseFoucus()}}>{result.name}</button></li>)}
                </ul>
            </div>

        </div>
    )
}