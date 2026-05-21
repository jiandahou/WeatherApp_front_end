import type { weatherinfoFetched } from "../../type/weatherType";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
type weatherState={
    weatherinfoArray: weatherinfoFetched[];
    weatherinfo?:weatherinfoFetched
    loading:boolean,
    error:string|undefined
}
const initialState:weatherState={
    weatherinfoArray: [],
    weatherinfo:undefined,
    loading:false,
    error:""
}
import { createAsyncThunk } from '@reduxjs/toolkit';
import { GetTheCityInfo } from  '../../action/serveractions';
import { getKnownCity } from '../../data/knownCities';
import { fetchWeatherByCoordinates } from '../../utils/weatherApiClient';
import {
  createSavedCityFromWeather,
  getSavedCityIdentity,
  normalizeSavedCityCookie,
  type SavedCityCookie,
} from '../../utils/savedCities';
import Cookies from 'js-cookie';

function getWeatherIdentity(weatherinfo: weatherinfoFetched): string | undefined {
  const location = weatherinfo?.daily.location?.trim().toLowerCase();
  if (!location) return undefined;
  const country = weatherinfo?.daily.country?.trim().toLowerCase();
  return country ? `${location}:${country}` : location;
}
function findWeatherIndexByIdentity(items: weatherinfoFetched[], target: weatherinfoFetched): number {
  const targetIdentity = getWeatherIdentity(target);
  if (!targetIdentity) return -1;

  return items.findIndex((weatherinfo) => getWeatherIdentity(weatherinfo) === targetIdentity);
}

function safelyUpdateCityCookie(weatherData: weatherinfoFetched) {
  try {
    if (!weatherData?.daily.location) return;
    const citycookie = Cookies.get("city");
    let cityList: SavedCityCookie[] = [];

    if (citycookie) {
      const parsed = JSON.parse(citycookie);
      if (Array.isArray(parsed)) {
        cityList = parsed.map(normalizeSavedCityCookie).filter((city): city is SavedCityCookie => !!city);
      }
    }

    const nextCity = createSavedCityFromWeather(weatherData);
    if (!nextCity) return;
    const nextIdentity = getSavedCityIdentity(nextCity);

    if (!cityList.some((city) => getSavedCityIdentity(city) === nextIdentity)) {
      cityList.push(nextCity);
    }

    Cookies.set("city", JSON.stringify(cityList), { expires: 7 });
  } catch {
    if (weatherData?.daily.location) {
      Cookies.set("city", JSON.stringify([{ name: weatherData.daily.location, country: weatherData.daily.country }]), { expires: 7 });
    }
  }
}
export const fetchAndSetInfo = createAsyncThunk<
  { data: weatherinfoFetched, setCurrentInfo: boolean, updateCookie: boolean }, 
  { name: string, setCurrentInfo?: boolean, updateCookie?: boolean, longitude?: number, latitude?: number, country?: string }, 
  { rejectValue: string }
>(
  'weather/fetchAndSetInfo',
  async ({ name, setCurrentInfo = true, updateCookie = false, longitude, latitude, country }, { rejectWithValue }) => {
    try {
      const knownCity = getKnownCity(name);
      const resolvedLatitude = latitude ?? knownCity?.latitude;
      const resolvedLongitude = longitude ?? knownCity?.longitude;
      const resolvedCountry = country ?? knownCity?.country;

      if(resolvedLongitude!=undefined && resolvedLatitude!=undefined) {
        const weatherData = await fetchWeatherByCoordinates(resolvedLatitude, resolvedLongitude);
        if (!weatherData) {
          return rejectWithValue("Failed to fetch weather data");
        }
        weatherData.daily.location = name;
        weatherData.daily.country = resolvedCountry;
        return { data: weatherData, setCurrentInfo, updateCookie };
      }
      const cityInfo = await GetTheCityInfo(name);
      if (cityInfo.status !== "success") {
        return rejectWithValue("Failed to fetch city info");
      }

     const { longitude: lng, latitude: lat } = cityInfo.value;
      const weatherData = await fetchWeatherByCoordinates(lat, lng);
      weatherData!.daily.location = name;
      weatherData!.daily.country = cityInfo.value.country;
      return { data: weatherData, setCurrentInfo, updateCookie };
    } catch (error) {
      return rejectWithValue("Unexpected error");
    }
  }
);
export const weatherSlice=createSlice(
    {name:"weather",
             initialState:initialState,
             reducers:{
                setWeatherinfoArray: (state,action: PayloadAction<weatherinfoFetched[]>)=>{
                    state.weatherinfoArray=action.payload
                },
                pushWeatherinfoArray:(state,action: PayloadAction<weatherinfoFetched>)=>{
                    if(findWeatherIndexByIdentity(state.weatherinfoArray, action.payload) < 0)
                    state.weatherinfoArray.push(action.payload)
                },
                setWeatherinfo: (state,action: PayloadAction<weatherinfoFetched>)=>{
                    state.weatherinfo=action.payload
                },
                setLocation:(state,action: PayloadAction<string>)=>{
                    if(state.weatherinfo)
                        state.weatherinfo.daily.location=action.payload
                },
                setWeatherState:(state,action: PayloadAction<weatherinfoFetched>)=>{
                  const existingIndex = findWeatherIndexByIdentity(state.weatherinfoArray, action.payload);
                  if (existingIndex >= 0) {
                    state.weatherinfoArray[existingIndex] = action.payload;
                  } else {
                    state.weatherinfoArray.push(action.payload)
                  }
                  state.weatherinfo=action.payload
                }
             },
             extraReducers: (builder) => {
                builder
                  .addCase(fetchAndSetInfo.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
                  })
                  .addCase(fetchAndSetInfo.fulfilled, (state, action) => {
                    state.loading = false;
                    const { data, setCurrentInfo, updateCookie } = action.payload;
                    const existingIndex = findWeatherIndexByIdentity(state.weatherinfoArray, data);
                    if(existingIndex >= 0) {
                      state.weatherinfoArray[existingIndex] = data;
                    } else {
                      state.weatherinfoArray.push(data);
                    }
                    if (setCurrentInfo) {
                      state.weatherinfo = data;
                    }
                    if (data&&updateCookie&&data.daily.location) {
                      safelyUpdateCityCookie(data);
                    }
                  })
                  .addCase(fetchAndSetInfo.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                  });
              },
             selectors:{
                selectWeatherinfoArray: (state) => state.weatherinfoArray,
                selectWeatherinfo: (state) => state.weatherinfo,
                selectLocation: (state) => state.weatherinfo?.daily.location,
                selectWeatherLoading: (state) => state.loading,
                selectWeatherError: (state) => state.error
             }
            }
)
export const {selectLocation,selectWeatherinfo,selectWeatherinfoArray,selectWeatherLoading,selectWeatherError}=weatherSlice.selectors
export const{setLocation,setWeatherinfo,setWeatherinfoArray,pushWeatherinfoArray,setWeatherState}=weatherSlice.actions
export default weatherSlice.reducer
