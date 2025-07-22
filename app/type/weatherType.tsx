
type weatherdailyinfo={
    highestTemperature:number,
    lowestTemperature:number,
    highestApparentTemperature:number,
    daylightDuration:number,
    sunshineDuration:number,
    precipitationSum:number,
    rainsum:number,
    showersSum:number,
    snowfallSum:number,
    precipitationHours:number,
    recipitationProbabilityMax:number,
    time:Date
    weathercode:number
}
type locationWeather={
    time:Date
    temperatureNow:number,
    apparentTemperatureNow:number,
    isDay:number,
    precipitation:number,
    rain:number,
    showers:number,
    snowfall:number,
    weatherCode:number,
    pressureMsl:number,
    surfacePressure:number ,
    windSpeed10m:number ,
    windDirection10m:number ,
    highestTemperature:number,
    lowestTemperature:number,
    highestApparentTemperature:number,
    daylightDuration:number,
    sunshineDuration:number,
    precipitationSum:number,
    rainsum:number,
    showersSum:number,
    snowfallSum:number,
    precipitationHours:number,
    recipitationProbabilityMax:number,
    weatherForNextTenDay:Array<weatherdailyinfo>
    location?:string
    country?:string
}
type hourlyForecast={
    time: Date,
    temperature2m:number,
    relativeHumidity2m:number,
    dewPoint2m:number,
    apparentTemperature:number,
    precipitationProbability:number,
    precipitation:number,
    rain:number,
    weatherCode:number,
    visibility:number,
    windSpeed10m:number,
    windDirection10m: number,
    soilTemperature0cm: number,
    soilMoisture0To1cm: number,
}
type weatherinfoFetched={
    daily:locationWeather,
    hourly:hourlyForecast[]}|undefined