"use client"
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAndSetInfo } from '../store/slice/weatherSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { useDebounce } from 'use-debounce';
import { AnimatePresence, motion } from 'motion/react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import amplifyOutputs from '@/amplify_outputs.json';


type City = Schema["SearchResult"]["type"];

export default function WeatherLocationSearchBar(){
    var [result, setResult] = useState<City[]>([]);
    var [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false); 
    const [debounced] = useDebounce(input, 250);
    const [openSearchbox, setOpenSearchbox] = useState(false);

    const dispatch = useDispatch<AppDispatch>()

    const client = useMemo(() => {
        Amplify.configure(amplifyOutputs);
        return generateClient<Schema>({ authMode: 'apiKey' });
    }, []);

    const loseFocus = useCallback(() => {
        setInput('');
        setResult([]);
        setIsLoading(false);
    }, []);
    
    const searchBarOnclick = useCallback((name: string) => {
        const index=name.indexOf('(');
        if (index !== -1) {
            name = name.slice(0, index).trim();
        }
        dispatch(fetchAndSetInfo({ name, setCurrentInfo: true, updateCookie: true }));
        setTimeout(() => loseFocus(), 100);
    }, [dispatch, loseFocus]);

    const checkresult = useCallback(async (input: string): Promise<City[]> => {
        if (!input || input.length < 2) {
            return [];
        }
        
        try {
            setIsLoading(true);
            
            const response = await client.queries.searchCities({
                query: input.trim(),
                limit: 5
            });
                        
            const cities: City[] = (response.data || [])
                .filter((result): result is NonNullable<typeof result> => !!result)
                .map(result => ({
                    name: result.name,
                    lat: result.lat,
                    lng: result.lng,
                    country: result.country,
                    admin1: result.admin1 || '',
                    admin2: result.admin2 || '',
                }));
            
            console.groupEnd();
            return cities;
            
        } catch (error) {            
            const result: City[] = [];
            
            try {
                const exactMatch = await client.models.City.get({ name: input });
                if (exactMatch.data) {
                    result.push(exactMatch.data);
                    if (result.length >= 5) {
                        console.groupEnd();
                        return result;
                    }
                }
            } catch (e) {
            }
            
            if (result.length < 5) {
                try {
                    const prefixMatch = await client.models.City.list({
                        filter: {
                            name: { beginsWith: input }
                        },
                        limit: 5 - result.length
                    });
                    
                    const newCities = prefixMatch.data.filter(
                        city => !result.some(r => r.name === city.name)
                    );
                    result.push(...newCities);
                } catch (e) {
                }
            }
            return result;
            
        } finally {
            setIsLoading(false);
        }
    }, [client]);

    const Checkresult = useCallback(checkresult, [checkresult]);
    
    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest('.search-container')) {
          loseFocus();
        }
      }, [loseFocus]);
      
    const shown = result.slice(0, 4);
    
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
            <div className="flex flex-row rounded-lg border-gray-400 relative backdrop-blur-md bg-white/40">
                <motion.input
                  type="text"
                  value={input}
                  placeholder="Search cities here..."
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <span className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
                    {isLoading ? '🔍' : '🔍'}
                </span>
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
                        {isLoading ? (
                            <li className="px-4 py-2 text-sm text-gray-500 text-center">
                                🔍 Searching with OpenSearch...
                            </li>
                        ) : shown.length > 0 ? (
                            shown.map((result) => (
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
                                  <div className="flex justify-between items-center">
                                    <span>{result.name}</span>
                                    <span className="text-xs text-gray-400">{result.country}</span>
                                  </div>
                                  {result.admin1 && (
                                    <div className="text-xs text-gray-500">
                                      {result.admin1}
                                    </div>
                                  )}
                                </button>
                              </li>
                            ))
                        ) : (
                            <li className="px-4 py-2 text-sm text-gray-500 text-center">
                                No cities found
                            </li>
                        )}
                        </ul>
                      </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}