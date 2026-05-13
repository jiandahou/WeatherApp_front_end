"use client"
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store/store';
import { fetchAndSetInfo, selectWeatherinfoArray, setWeatherinfo } from '../store/slice/weatherSlice';
import { useDebounce } from 'use-debounce';
import { AnimatePresence, motion } from 'motion/react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import amplifyOutputs from '@/amplify_outputs.json';
import Image from 'next/image';


type City = Schema["SearchResult"]["type"];

export default function WeatherLocationSearchBar(){
    var [result, setResult] = useState<City[]>([]);
    var [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false); 
    const [debounced] = useDebounce(input, 250);
    const [openSearchbox, setOpenSearchbox] = useState(false);
    const dispatch = useDispatch<AppDispatch>()
    const weatherinfoArray = useSelector(selectWeatherinfoArray)
    const enableOpenMeteoFallback = false;

    const client = useMemo(() => {
        Amplify.configure(amplifyOutputs);
        return generateClient<Schema>({ authMode: 'apiKey' });
    }, []);

    const loseFocus = useCallback(() => {
        setInput('');
        setResult([]);
        setIsLoading(false);
    }, []);

    const searchBarOnclick = useCallback((name: string, longitude: number, latitude: number, country: string) => {
        const index=name.indexOf('(');
        if (index !== -1) {
            name = name.slice(0, index).trim();
        }
        const cached = weatherinfoArray.find((weatherinfo) => weatherinfo?.daily.location === name);
        if (cached) {
            dispatch(setWeatherinfo(cached));
        } else {
            dispatch(fetchAndSetInfo({ name, setCurrentInfo: true, updateCookie: true, longitude, latitude, country }));
        }
        setTimeout(() => loseFocus(), 100);
    }, [dispatch, loseFocus, weatherinfoArray]);

    const searchByOpenMeteo = useCallback(async (query: string): Promise<City[]> => {
        const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
        url.searchParams.set('name', query.trim());
        url.searchParams.set('count', '5');
        url.searchParams.set('language', 'en');
        url.searchParams.set('format', 'json');

        const res = await fetch(url.toString());
        if (!res.ok) {
            return [];
        }

        const data = await res.json();
        const results: any[] = Array.isArray(data?.results) ? data.results : [];
        return results
            .filter((item: any) => item?.name && Number.isFinite(item?.latitude) && Number.isFinite(item?.longitude))
            .map((item: any) => ({
                name: item.name,
                lat: Number(item.latitude),
                lng: Number(item.longitude),
                country: item.country_code ?? item.country ?? '',
                admin1: item.admin1 ?? '',
                admin2: item.admin2 ?? '',
            }));
    }, []);

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

            if (cities.length > 0) {
                return cities;
            }

            // Fallback is intentionally disabled for backend validation.
            if (enableOpenMeteoFallback) {
                return await searchByOpenMeteo(input);
            }
            return [];
            
        } catch (error) {            
            // Fallback is intentionally disabled for backend validation.
            if (enableOpenMeteoFallback) {
                return await searchByOpenMeteo(input);
            }
            return [];
            
        } finally {
            setIsLoading(false);
        }
    }, [client, enableOpenMeteoFallback, searchByOpenMeteo]);

    const Checkresult = useCallback(checkresult, [checkresult]);
    
    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest('.search-container')) {
          loseFocus();
        }
      }, [loseFocus]);
      
    const shown = result.slice(0, 4);
    const listboxId = "weather-city-search-results";
    
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
        <div className='search-container relative z-[999] mt-0 w-full shrink-0 space-y-2 sm:mt-2 sm:w-72 sm:space-y-4'>
            <div className="flex flex-row rounded-lg border-gray-400 relative backdrop-blur-md bg-white/50 items-center">
                <motion.input
                  id="weather-city-search"
                  type="text"
                  value={input}
                  placeholder="Search cities here..."
                  onChange={(e) => setInput(e.target.value)}
                  role="combobox"
                  aria-label="Search cities"
                  aria-expanded={openSearchbox}
                  aria-controls={listboxId}
                  aria-autocomplete="list"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 sm:py-2"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <span aria-hidden className='absolute inset-y-0 right-3 flex items-center pointer-events-none text-white text-lg'>
                    {isLoading ? '🔍' : '🔍'}
                </span>
                {input && (
                    <button
                    type="button"
                    aria-label="Clear city search"
                    onClick={() => setInput('')}
                    className="absolute inset-y-0 right-6 pr-3 text-gray-600 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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
                        className="absolute mt-1 w-full top-full z-[9999]"
                      >
                        <ul id={listboxId} role="listbox" aria-label="Search city results" className="bg-ui-surface-2 rounded-lg shadow-2xl border border-ui-stroke-soft/30">
                        {isLoading ? (
                            <li role="status" aria-live="polite" className="px-4 py-2 text-sm text-ui-text-2 text-center">
                                🔍 Searching with OpenSearch...
                            </li>
                        ) : shown.length > 0 ? (
                            shown.map((result) => (
                              <li
                                key={result.name + result.lat}
                                role="option"
                                aria-label={`${result.name}, ${result.country}`}
                                className="px-4 py-2 cursor-pointer text-sm hover:bg-ui-overlay-strong/40 focus:bg-ui-overlay-strong/40 transition-colors duration-150 text-ui-text-1 border-b border-ui-stroke-soft/10 last:border-b-0"
                              >
                                <button
                                    type="button"
                                    className="w-full rounded-lg text-left truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                                    onClick={(e) => {
                                        searchBarOnclick(result.name, result.lng, result.lat, result.country);
                                        loseFocus();
                                    }}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-ui-text-1 font-medium">{result.name}</span>
                                    <div className="flex items-center gap-1">
                                    <img src={`https://flagcdn.com/w20/${result.country.toLowerCase()}.png`} alt={result.country} width={16} height={16} />
                                    <span className="text-xs text-ui-text-2">{result.country}</span>
                                    </div>
                                  </div>
                                </button>
                              </li>
                            ))
                        ) : (
                            <li role="status" aria-live="polite" className="px-4 py-2 text-sm text-ui-text-2 text-center">
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