"use client"
import { useCallback, useEffect, useMemo, useState } from 'react';
//changing the json to mysql request would be better choice 
import cities from '../cities.json';
import clsx from 'clsx';
import path from 'node:path';
import { fetchAndSetInfo } from '../store/slice/weatherSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { useDebounce } from 'use-debounce';


export default function WeatherLocationSearchBar(){
    var [result,setResult]=useState([] as any[]);
    var [input,setInput]=useState("");
    const [debounced] = useDebounce(input, 250);

    const dispatch = useDispatch<AppDispatch>()
    const cityList = useMemo(() => 
        Object.values(cities).map((city: any) => ({
          name: city.name,
          lat: parseFloat(city.lat),
          lng: parseFloat(city.lng),
          country: city.country,
        })),
        []
      );
    type city={
        name:string ,
        lat: number,
        lng: number,
        country: string,
    }
    const loseFocus = useCallback(() => {
        setInput('');
        setResult([]);
    }, []);
    const searchBarOnclick = useCallback((name: string) => {
        dispatch(fetchAndSetInfo({ name, setCurrentInfo: true, updateCookie: true }));
        loseFocus();
      }, [dispatch, loseFocus]);
    var openSearchbox=false
    function checkresult(input:string){
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
    const Checkresult =useCallback(checkresult,[cityList])
    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest('.search-container')) {
          loseFocus();
        }
      }, [loseFocus]);
    const shown=result.slice(0,4)
    openSearchbox=(input.length>0)?true:false
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }, [handleClickOutside]);
    useEffect(() => {
        if (!debounced) {
          loseFocus();
        } else {
          setResult(Checkresult(debounced));
        }
      }, [debounced, loseFocus,Checkresult]);
    return(
        <div className='sm:w-64 search-container shrink-0 space-y-4 z-20'>
            <div className="flex flex-row rounded-lg border-gray-400 relative ">
                <input type="text" placeholder="Searching for location" value={input} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-150" onChange={(e=>{setInput(e.target.value)})}></input>
                <span  className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>🔍</span>
                {input && (
                    <button
                    onClick={() => setInput('')}
                    className="absolute inset-y-0 right-6 pr-3 text-gray-400 hover:text-gray-600"
                    >
                    ×
                    </button>
                )}
                        <ul
                        role="listbox"
                        className={clsx(
                            "absolute mt-1 w-full top-full bg-white rounded-lg shadow-lg overflow-hidden transition-opacity duration-200 ease-in-out",
                            {
                            "opacity-0 pointer-events-none": !openSearchbox,
                            "opacity-100": openSearchbox,
                            }
                        )
                    }                        >
                    {shown.map(result=><li key={result.name+result.lat} className='px-4 py-2 cursor-pointer text-sm hover:bg-cyan-100 focus:bg-cyan-100 transition-colors duration-150'><button className='w-full rounded-lg text-left truncate' onClick={(e) => {searchBarOnclick(result.name);loseFocus()}}>{result.name}</button></li>)}
                </ul>
            </div>

        </div>
    )
}