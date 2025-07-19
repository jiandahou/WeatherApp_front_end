"use client"
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAndSetInfo } from '../store/slice/weatherSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { useDebounce } from 'use-debounce';
import { AnimatePresence, motion } from 'motion/react';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';

// 使用 Amplify 生成的类型
type City = Schema["City"]["type"];

export default function WeatherLocationSearchBar(){
    var [result,setResult]=useState<City[]>([]);
    var [input,setInput]=useState("");
    const [debounced] = useDebounce(input, 250);
    const [openSearchbox, setOpenSearchbox] = useState(false);

    const dispatch = useDispatch<AppDispatch>()

    const loseFocus = useCallback(() => {
        setInput('');
        setResult([]);
    }, []);

    const client = generateClient<Schema>();
    
    const searchBarOnclick = useCallback((name: string) => {
        dispatch(fetchAndSetInfo({ name, setCurrentInfo: true, updateCookie: true }));
        setTimeout(() => loseFocus(), 100);
    }, [dispatch, loseFocus]);

    async function checkresult(input: string): Promise<City[]> {
        const result: City[] = [];
        
        const exactMatch = await client.models.City.list({
            filter: {
                name: { eq: input }
            },
            limit: 5
        });
        
        result.push(...exactMatch.data);
        
        if (exactMatch.data.length < 5) {
            const prefixMatch = await client.models.City.list({
                filter: {
                    name: { beginsWith: input }
                },
                limit: 5 - exactMatch.data.length
            });
            
            result.push(...prefixMatch.data);
            
            if (prefixMatch.data.length + exactMatch.data.length < 5) {
                const suffixMatch = await client.models.City.list({
                    filter: {
                        name: { contains: input }
                    },
                    limit: 5 - (prefixMatch.data.length + exactMatch.data.length)
                });
                
                result.push(...suffixMatch.data);
            }
        }
        
        return result;
    }
    const Checkresult =useCallback(checkresult,[])
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
            // 使用异步函数处理
            const searchCities = async () => {
                try {
                    const cities = await Checkresult(debounced);
                    setResult(cities);
                } catch (error) {
                    console.error('Search error:', error);
                    setResult([]);
                }
            };
            
            searchCities();
        }
    }, [debounced, loseFocus, Checkresult]);
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