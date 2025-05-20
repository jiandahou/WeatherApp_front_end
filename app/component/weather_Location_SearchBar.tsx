"use client"
import { useCallback, useEffect, useMemo, useState } from 'react';
//changing the json to mysql request would be better choice 
import cities from '../cities.json';
import { fetchAndSetInfo } from '../store/slice/weatherSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { useDebounce } from 'use-debounce';
import { AnimatePresence, motion } from 'motion/react';


export default function WeatherLocationSearchBar(){
    var [result,setResult]=useState([] as any[]);
    var [input,setInput]=useState("");
    const [debounced] = useDebounce(input, 250);
    const [openSearchbox, setOpenSearchbox] = useState(false);

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
        setTimeout(() => loseFocus(), 100);;
      }, [dispatch, loseFocus]);
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
      useEffect(() => {
      setOpenSearchbox(input.length > 0);
      }, [input]);
    return(
        <div className='sm:w-64 search-container shrink-0 space-y-4 z-20 mt-2'>
            <div className="flex flex-row rounded-lg border-gray-400 relative backdrop-blur-md bg-white/40  ">
                <motion.input
                  type="text"
                  value={input}
                  placeholder="Searching for location"
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <span  className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>🔍</span>
                {input && (
                    <button
                    onClick={() => setInput('')}
                    className="absolute inset-y-0 right-6 pr-3 text-gray-400 hover:text-gray-600"
                    >
                    ×
                    </button>
                )}
                  <AnimatePresence initial={false} mode="wait">
                    {openSearchbox && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute mt-1 w-full top-full z-50"
                      >
                        <ul className="bg-white rounded-lg shadow-lg">
                        {shown.map((result) => (
                          <li
                            key={result.name + result.lat}
                            className="px-4 py-2 cursor-pointer text-sm hover:bg-cyan-100 focus:bg-cyan-100 transition-colors duration-150"
                          >
                            <button
                              className="w-full rounded-lg text-left truncate"
                              onClick={(e) => {
                                searchBarOnclick(result.name);
                                loseFocus();
                              }}
                            >
                              {result.name}
                            </button>
                          </li>
                          
                        ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
            </div>

        </div>
    )
}