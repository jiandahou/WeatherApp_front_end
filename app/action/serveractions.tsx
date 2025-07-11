    "use server"
    import { fetchWeatherApi } from "openmeteo"
    import OpenAI from "openai";
    import { WeatherCodeInterpretator } from "../weatherCode/weatherCodeInterpretation";
    import dotenv from 'dotenv';
    if (process.env.NODE_ENV === 'production') {
        dotenv.config({ path: '.env.production.local' });
        }

    
    export async function GetWeatherSummary(weatherInfo:locationWeather) {
        const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    });
        const {
        location,
        time,
        temperatureNow,
        apparentTemperatureNow,
        windSpeed10m,
        windDirection10m,
        precipitation,
        weatherCode,
        highestTemperature,
        lowestTemperature,
        recipitationProbabilityMax,
        sunshineDuration,
    } = weatherInfo;
    const locationString = location ?? "the specified area";
    const dateStr = new Date(time).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    let weathername=WeatherCodeInterpretator[weatherCode]
    const userContent = `
    Here is the weather data for ${locationString} on ${dateStr}:
    - Current temperature: ${temperatureNow}°C
    - Feels like: ${apparentTemperatureNow}°C
    - High: ${highestTemperature}°C / Low: ${lowestTemperature}°C
    - Wind: ${windSpeed10m} km/h, direction ${windDirection10m}°
    - Precipitation: ${precipitation} mm
    - Chance of rain: ${recipitationProbabilityMax}%
    - Sunshine duration: ${sunshineDuration} seconds
    - Weather code: ${weatherCode}
    - weather:${weathername}

    Please summarize this data into a short, natural English sentence suitable for a weather forecast.
    `;
        const completion=await openai.chat.completions.create({model:"gpt-3.5-turbo",
            messages:[
                {role:"system",
                content:"You are a professional weather broadcaster. Given structured weather data, respond with a short, natural-sounding summary in English. Keep it concise, clear, and suitable for the general public"
                },
                {
                role: "user",
                content: userContent,
                }
            ],
            temperature:0.7
        })
        return completion.choices[0].message.content
    }
    export async function GetWeatherForecast(this: any, la:number,long:number) {
        const params = {
            "latitude": la,
            "longitude": long,
            "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "precipitation", "rain", "showers", "snowfall", "weather_code", "pressure_msl", "surface_pressure", "wind_speed_10m", "wind_direction_10m"],
            "hourly": ["temperature_2m", "relative_humidity_2m", "dew_point_2m", "apparent_temperature", "precipitation_probability", "precipitation", "rain", "weather_code", "visibility", "wind_speed_10m", "wind_direction_10m", "soil_temperature_0cm", "soil_moisture_0_to_1cm"],
            "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max", "apparent_temperature_min", "sunrise", "sunset", "daylight_duration", "sunshine_duration", "precipitation_sum", "rain_sum", "showers_sum", "snowfall_sum", "precipitation_hours", "precipitation_probability_max"],
            "timezone": "auto",
            "past_days": 7,
            "forecast_days": 14    
        }
        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);
        console.log("GetWeatherForecast:", Date.now(),responses);
        const range = (start: number, stop: number, step: number) =>
            Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);
        const response = responses[0];
        const utcOffsetSeconds = 0;
        const timezone = response.timezone();
        const timezoneAbbreviation = response.timezoneAbbreviation();
        const latitude = response.latitude();
        const longitude = response.longitude();
        
        const current = response.current()!;
        const hourly = response.hourly()!;
        const daily = response.daily()!;
        const weatherData = {
            current: {
                time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
                temperature2m: current.variables(0)!.value(),
                relativeHumidity2m: current.variables(1)!.value(),
                apparentTemperature: current.variables(2)!.value(),
                isDay: current.variables(3)!.value(),
                precipitation: current.variables(4)!.value(),
                rain: current.variables(5)!.value(),
                showers: current.variables(6)!.value(),
                snowfall: current.variables(7)!.value(),
                weatherCode: current.variables(8)!.value(),
                pressureMsl: current.variables(9)!.value(),
                surfacePressure: current.variables(10)!.value(),
                windSpeed10m: current.variables(11)!.value(),
                windDirection10m: current.variables(12)!.value(),
            },
            hourly: {
                time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
                    (t) => new Date((t + utcOffsetSeconds) * 1000)
                ),
                temperature2m: hourly.variables(0)!.valuesArray()!,
                relativeHumidity2m: hourly.variables(1)!.valuesArray()!,
                dewPoint2m: hourly.variables(2)!.valuesArray()!,
                apparentTemperature: hourly.variables(3)!.valuesArray()!,
                precipitationProbability: hourly.variables(4)!.valuesArray()!,
                precipitation: hourly.variables(5)!.valuesArray()!,
                rain: hourly.variables(6)!.valuesArray()!,
                weatherCode: hourly.variables(7)!.valuesArray()!,
                visibility: hourly.variables(8)!.valuesArray()!,
                windSpeed10m: hourly.variables(9)!.valuesArray()!,
                windDirection10m: hourly.variables(10)!.valuesArray()!,
                soilTemperature0cm: hourly.variables(11)!.valuesArray()!,
                soilMoisture0To1cm: hourly.variables(12)!.valuesArray()!,
            },
            daily: {
                time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
                    (t) => new Date((t + utcOffsetSeconds) * 1000)
                ),
                weatherCode: daily.variables(0)!.valuesArray()!,
                temperature2mMax: daily.variables(1)!.valuesArray()!,
                temperature2mMin: daily.variables(2)!.valuesArray()!,
                apparentTemperatureMax: daily.variables(3)!.valuesArray()!,
                apparentTemperatureMin: daily.variables(4)!.valuesArray()!,
                sunrise: daily.variables(5)!.valuesArray()!,
                sunset: daily.variables(6)!.valuesArray()!,
                daylightDuration: daily.variables(7)!.valuesArray()!,
                sunshineDuration: daily.variables(8)!.valuesArray()!,
                precipitationSum: daily.variables(9)!.valuesArray()!,
                rainSum: daily.variables(10)!.valuesArray()!,
                showersSum: daily.variables(11)!.valuesArray()!,
                snowfallSum: daily.variables(12)!.valuesArray()!,
                precipitationHours: daily.variables(13)!.valuesArray()!,
                precipitationProbabilityMax: daily.variables(14)!.valuesArray()!,
            },
        
        };
        
        // `weatherData` now contains a simple structure with arrays for datetime and weather data
        // for (let i = 0; i < weatherData.hourly.time.length; i++) {
        //     console.log(
        //         weatherData.hourly.time[i].toISOString(),
        //         weatherData.hourly.temperature2m[i],
        //         weatherData.hourly.relativeHumidity2m[i],
        //         weatherData.hourly.dewPoint2m[i],
        //         weatherData.hourly.apparentTemperature[i],
        //         weatherData.hourly.precipitationProbability[i],
        //         weatherData.hourly.precipitation[i],
        //         weatherData.hourly.rain[i],
        //         weatherData.hourly.weatherCode[i],
        //         weatherData.hourly.visibility[i],
        //         weatherData.hourly.windSpeed10m[i],
        //         weatherData.hourly.windDirection10m[i],
        //         weatherData.hourly.soilTemperature0cm[i],
        //         weatherData.hourly.soilMoisture0To1cm[i]
        //     );
        // }
        // for (let i = 0; i < weatherData.daily.time.length; i++) {
        //     console.log(
        //         weatherData.daily.time[i].toISOString(),
        //         weatherData.daily.weatherCode[i],
        //         weatherData.daily.temperature2mMax[i],
        //         weatherData.daily.temperature2mMin[i],
        //         weatherData.daily.apparentTemperatureMax[i],
        //         weatherData.daily.apparentTemperatureMin[i],
        //         weatherData.daily.daylightDuration[i],
        //         weatherData.daily.sunshineDuration[i],
        //         weatherData.daily.precipitationSum[i],
        //         weatherData.daily.rainSum[i],
        //         weatherData.daily.showersSum[i],
        //         weatherData.daily.snowfallSum[i],
        //         weatherData.daily.precipitationHours[i],
        //         weatherData.daily.precipitationProbabilityMax[i]
        //     );
        // }
        const index=7
        const weahterInfoTodayWithHourlyForNextTenDay:locationWeather={
            time:weatherData.current.time,
            temperatureNow:weatherData.current.temperature2m,
            apparentTemperatureNow:weatherData.current.apparentTemperature,
            isDay:weatherData.current.isDay,
            precipitation:weatherData.current.precipitation,
            rain:weatherData.current.rain,
            showers:weatherData.current.showers,
            snowfall:weatherData.current.snowfall,
            weatherCode:weatherData.current.weatherCode,
            pressureMsl:weatherData.current.pressureMsl,
            surfacePressure: weatherData.current.surfacePressure,
            windSpeed10m: weatherData.current.windSpeed10m,
            windDirection10m: weatherData.current.windDirection10m,
            highestTemperature:weatherData.daily.temperature2mMax[index],
            lowestTemperature:weatherData.daily.temperature2mMin[index],
            highestApparentTemperature:weatherData.daily.apparentTemperatureMax[index],
            daylightDuration:weatherData.daily.daylightDuration[index],
            sunshineDuration:weatherData.daily.sunshineDuration[index],
            precipitationSum:weatherData.daily.precipitationSum[index],
            rainsum:weatherData.daily.rainSum[index],
            showersSum:weatherData.daily.showersSum[index],
            snowfallSum:weatherData.daily.snowfallSum[index],
            precipitationHours:weatherData.daily.precipitationHours[index],
            recipitationProbabilityMax:weatherData.daily.precipitationProbabilityMax[index],
            weatherForNextTenDay:[] as Array<weatherdailyinfo>
        }
        let timeNow=weatherData.current.time
        let dayNow=timeNow.getDate()
        let monthNow=timeNow.getMonth()
        for (let i = 0; i < weatherData.daily.time.length; i++){
            if(((weatherData.daily.time[i].getDate()>=dayNow)&&(weatherData.daily.time[i].getMonth()==monthNow))||(weatherData.daily.time[i].getMonth()>monthNow)){
                console.log(weatherData.daily.time[i].getDate())
                weahterInfoTodayWithHourlyForNextTenDay.weatherForNextTenDay.push(
                    {   highestTemperature:weatherData.daily.temperature2mMax[i],
                        lowestTemperature:weatherData.daily.temperature2mMin[i],
                        highestApparentTemperature:weatherData.daily.apparentTemperatureMax[index],
                        daylightDuration:weatherData.daily.daylightDuration[i],
                        sunshineDuration:weatherData.daily.sunshineDuration[i],
                        precipitationSum:weatherData.daily.precipitationSum[i],
                        rainsum:weatherData.daily.rainSum[i],
                        showersSum:weatherData.daily.showersSum[i],
                        snowfallSum:weatherData.daily.snowfallSum[i],
                        precipitationHours:weatherData.daily.precipitationHours[i],
                        recipitationProbabilityMax:weatherData.daily.precipitationProbabilityMax[i],
                        time:weatherData.daily.time[i],
                        weathercode:weatherData.daily.weatherCode[i]})
            }
        }
        let indexForhourly=-1
        let hourlyForecastInfo:Array<hourlyForecast>=[]
        for (let i = 0; i < weatherData.hourly.time.length; i++){
            if(((weatherData.hourly.time[i].getDate()>=dayNow)&&(weatherData.hourly.time[i].getMonth()==monthNow))||(weatherData.hourly.time[i].getMonth()>monthNow)){
                hourlyForecastInfo.push({
                    time:weatherData.hourly.time[i],
                    temperature2m:weatherData.hourly.temperature2m[i],
                    relativeHumidity2m:weatherData.hourly.relativeHumidity2m[i],
                    dewPoint2m:weatherData.hourly.dewPoint2m[i],
                    apparentTemperature:weatherData.hourly.apparentTemperature[i],
                    precipitationProbability:weatherData.hourly.precipitationProbability[i],
                    precipitation:weatherData.hourly.precipitation[i],
                    rain:weatherData.hourly.rain[i],
                    weatherCode:weatherData.hourly.weatherCode[i],
                    visibility:weatherData.hourly.visibility[i],
                    windSpeed10m:weatherData.hourly.windSpeed10m[i],
                    windDirection10m: weatherData.hourly.windDirection10m[i],
                    soilTemperature0cm: weatherData.hourly.soilTemperature0cm[i],
                    soilMoisture0To1cm: weatherData.hourly.soilMoisture0To1cm[i],
                })
            }
        }
        console.log(weahterInfoTodayWithHourlyForNextTenDay)
        console.log(hourlyForecastInfo[0])
        return{ daily:weahterInfoTodayWithHourlyForNextTenDay,
                hourly:hourlyForecastInfo
        } as weatherinfoFetched;
        
    }
    async function fetchFromBackend(endpoint: string) {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;
        try {
            const response = await fetch(`${baseUrl}${endpoint}`,{
            cache: 'force-cache'
            });
            console.log('🔍 Fetching from backend: ', `${baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetching data by:", new Date(Date.now()).toLocaleString(), data);
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error; 
        }
    }

    export async function GetTheCityInfo(locationName: string) {
        const encodedName = encodeURIComponent(locationName.trim());
        return fetchFromBackend(`/name/${encodedName}`);
    }

    export async function GetTheCityInfoByLola(longitude: number, latitude: number) {        return fetchFromBackend(`/location/${longitude}/${latitude}`);
    }