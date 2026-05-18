"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchAndSetInfo, selectWeatherinfoArray, setWeatherinfo } from "../store/slice/weatherSlice";
import { useDebounce } from "use-debounce";
import { AnimatePresence, motion } from "motion/react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";
import amplifyOutputs from "@/amplify_outputs.json";
import { AlertCircle, Loader2, Search, X } from "lucide-react";

type City = Schema["SearchResult"]["type"];

export default function WeatherLocationSearchBar() {
  const [result, setResult] = useState<City[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [debounced] = useDebounce(input, 250);
  const [openSearchbox, setOpenSearchbox] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const weatherinfoArray = useSelector(selectWeatherinfoArray);
  const enableOpenMeteoFallback = false;

  const client = useMemo(() => {
    Amplify.configure(amplifyOutputs);
    return generateClient<Schema>({ authMode: "apiKey" });
  }, []);

  const loseFocus = useCallback(() => {
    setInput("");
    setResult([]);
    setIsLoading(false);
    setSearchError(null);
    setHasSearched(false);
  }, []);

  const searchBarOnclick = useCallback((name: string, longitude: number, latitude: number, country: string) => {
    const index = name.indexOf("(");
    if (index !== -1) {
      name = name.slice(0, index).trim();
    }

    const cached = weatherinfoArray.find((weatherinfo) => {
      const sameName = weatherinfo?.daily.location === name;
      const sameCountry = country ? weatherinfo?.daily.country === country : true;
      return sameName && sameCountry;
    });
    if (cached) {
      dispatch(setWeatherinfo(cached));
    } else {
      dispatch(fetchAndSetInfo({ name, setCurrentInfo: true, updateCookie: true, longitude, latitude, country }));
    }

    setTimeout(() => loseFocus(), 100);
  }, [dispatch, loseFocus, weatherinfoArray]);

  const searchByOpenMeteo = useCallback(async (query: string): Promise<City[]> => {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query.trim());
    url.searchParams.set("count", "5");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

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
        country: item.country_code ?? item.country ?? "",
        admin1: item.admin1 ?? "",
        admin2: item.admin2 ?? "",
      }));
  }, []);

  const checkresult = useCallback(async (value: string): Promise<City[]> => {
    const query = value.trim();
    if (!query || query.length < 2) {
      setSearchError(null);
      setHasSearched(false);
      return [];
    }

    try {
      setIsLoading(true);
      setSearchError(null);
      setHasSearched(false);

      const response = await client.queries.searchCities({
        query,
        limit: 5,
      });

      const cities: City[] = (response.data || [])
        .filter((item): item is NonNullable<typeof item> => !!item)
        .map((item) => ({
          name: item.name,
          lat: item.lat,
          lng: item.lng,
          country: item.country,
          admin1: item.admin1 || "",
          admin2: item.admin2 || "",
        }));

      if (cities.length > 0) {
        setHasSearched(true);
        return cities;
      }

      if (enableOpenMeteoFallback) {
        const fallbackCities = await searchByOpenMeteo(query);
        setHasSearched(true);
        return fallbackCities;
      }

      setHasSearched(true);
      return [];
    } catch {
      if (enableOpenMeteoFallback) {
        const fallbackCities = await searchByOpenMeteo(query);
        setHasSearched(true);
        return fallbackCities;
      }

      setSearchError("Search is temporarily unavailable. Try again in a moment.");
      setHasSearched(true);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [client, enableOpenMeteoFallback, searchByOpenMeteo]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest(".search-container")) {
      loseFocus();
    }
  }, [loseFocus]);

  const shown = result.slice(0, 4);
  const listboxId = "weather-city-search-results";

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (!debounced) {
      loseFocus();
      return;
    }

    let ignore = false;
    async function searchCities() {
      const cities = await checkresult(debounced);
      if (!ignore) {
        setResult(cities);
      }
    }

    searchCities();
    return () => {
      ignore = true;
    };
  }, [debounced, loseFocus, checkresult]);

  useEffect(() => {
    setOpenSearchbox(input.length > 0);
  }, [input]);

  return (
    <div className="search-container relative z-[999] mt-0 w-full shrink-0 space-y-2 sm:mt-2 sm:w-72 sm:space-y-4">
      <div className="relative flex flex-row items-center rounded-lg border-gray-400 bg-white/70 backdrop-blur-md">
        <Search aria-hidden className="absolute left-3 h-4 w-4 text-gray-500" />
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
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-16 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 sm:py-2"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        </span>
        {input ? (
          <button
            type="button"
            aria-label="Clear city search"
            onClick={() => setInput("")}
            className="absolute inset-y-0 right-8 flex items-center text-gray-600 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}

        <AnimatePresence initial={false} mode="wait">
          {openSearchbox ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full z-[9999] mt-1 w-full"
            >
              <ul id={listboxId} role="listbox" aria-label="Search city results" className="rounded-lg border border-ui-stroke-soft/30 bg-ui-surface-2 shadow-2xl">
                {isLoading ? (
                  <li role="status" aria-live="polite" className="px-4 py-2 text-center text-sm text-ui-text-2">
                    Searching cities...
                  </li>
                ) : searchError ? (
                  <li role="status" aria-live="polite" className="flex items-start gap-2 px-4 py-3 text-sm text-amber-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
                    <span>{searchError}</span>
                  </li>
                ) : shown.length > 0 ? (
                  shown.map((item) => {
                    const country = item.country ?? "";
                    return (
                      <li
                        key={`${item.name}-${item.lat}`}
                        role="option"
                        aria-label={`${item.name}, ${country}`}
                        className="cursor-pointer border-b border-ui-stroke-soft/10 px-4 py-2 text-sm text-ui-text-1 transition-colors duration-150 last:border-b-0 hover:bg-ui-overlay-strong/40 focus:bg-ui-overlay-strong/40"
                      >
                        <button
                          type="button"
                          className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                          onClick={() => {
                            searchBarOnclick(item.name, item.lng, item.lat, country);
                            loseFocus();
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate font-medium text-ui-text-1">{item.name}</span>
                            <div className="flex flex-none items-center gap-1">
                              {country ? (
                                <img src={`https://flagcdn.com/w20/${country.toLowerCase()}.png`} alt={country} width={16} height={16} />
                              ) : null}
                              <span className="text-xs text-ui-text-2">{country}</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })
                ) : hasSearched ? (
                  <li role="status" aria-live="polite" className="px-4 py-2 text-center text-sm text-ui-text-2">
                    No cities found
                  </li>
                ) : (
                  <li role="status" aria-live="polite" className="px-4 py-2 text-center text-sm text-ui-text-2">
                    Type at least 2 characters
                  </li>
                )}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
