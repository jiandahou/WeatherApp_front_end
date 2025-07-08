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
import { GetTheCityInfo, GetWeatherForecast } from  '../../action/serveractions';
import Cookies from 'js-cookie';

function safelyUpdateCityCookie(newCity: string) {
  try {
    const citycookie = Cookies.get("city");
    let cityList: string[] = [];

    if (citycookie) {
      const parsed = JSON.parse(citycookie);
      if (Array.isArray(parsed) && parsed.every((c) => typeof c === "string" && c.trim() !== "")) {
        cityList = parsed;
      } else {
        console.warn("Invalid city cookie format, resetting...");
      }
    }

    if (!cityList.includes(newCity)) {
      cityList.push(newCity);
    }

    Cookies.set("city", JSON.stringify(cityList), { expires: 7 });
  } catch (error) {
    console.error("Failed to update city cookie. Resetting...", error);
    Cookies.set("city", JSON.stringify([newCity]), { expires: 7 });
  }
}
export const fetchAndSetInfo = createAsyncThunk<
  { data: weatherinfoFetched, setCurrentInfo: boolean, updateCookie: boolean }, 
  { name: string, setCurrentInfo?: boolean, updateCookie?: boolean }, 
  { rejectValue: string }
>(
  'weather/fetchAndSetInfo',
  async ({ name, setCurrentInfo = true, updateCookie = false }, { rejectWithValue }) => {
    try {
      const cityInfo = await GetTheCityInfo(name);
      if (cityInfo.status !== "success") {
        return rejectWithValue("Failed to fetch city info");
      }

      const { longitude, latitude } = cityInfo.value;
      const weatherData = await GetWeatherForecast(latitude, longitude);
      weatherData!.daily.location = name;
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
                    if(state.weatherinfoArray.every((weatherinfo)=>{return weatherinfo?.daily.location==action.payload?.daily.location}))
                    state.weatherinfoArray.push(action.payload)
                },
                setWeatherinfo: (state,action: PayloadAction<weatherinfoFetched>)=>{
                    state.weatherinfo=action.payload
                },
                setLocation:(state,action: PayloadAction<string>)=>{
                    if(state.weatherinfo)
                        state.weatherinfo.daily.location=action.payload
                    else
                    {
                        console.log("Weatherinfo is not existing")
                    }
                },
                setWeatherState:(state,action: PayloadAction<weatherinfoFetched>)=>{
                    if(state.weatherinfoArray.every((weatherinfo)=>{return weatherinfo?.daily.location!==action.payload?.daily.location}))
                    {
                        state.weatherinfoArray.push(action.payload)
                        state.weatherinfo=action.payload
                    }
                    else {
                        console.log("Already have same info for that city:", action.payload?.daily.location);
                    }
                }
             },
             extraReducers: (builder) => {
                builder
                  .addCase(fetchAndSetInfo.pending, (state) => {
                    state.loading = true;
                    state.error = undefined;
                  })
                  .addCase(fetchAndSetInfo.fulfilled, (state, action) => {
                    console.log("Fetched weather data:", action.payload.data,new Date(Date.now()).toLocaleString());
                    state.loading = false;
                    const { data, setCurrentInfo, updateCookie } = action.payload;
                    state.weatherinfoArray.push(data);
                    if (setCurrentInfo) {
                      state.weatherinfo = data;
                    }
                    if (data&&updateCookie&&data.daily.location) {
                      safelyUpdateCityCookie(data.daily.location);
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
                selectLocation: (state) => state.weatherinfo?.daily.location
             }
            }
)
export const {selectLocation,selectWeatherinfo,selectWeatherinfoArray}=weatherSlice.selectors
export const{setLocation,setWeatherinfo,setWeatherinfoArray,pushWeatherinfoArray,setWeatherState}=weatherSlice.actions
export default weatherSlice.reducer