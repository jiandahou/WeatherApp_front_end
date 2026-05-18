import OpenAI from "openai";
import type { locationWeather } from "@/app/type/weatherType";
import { WeatherCodeInterpretator } from "@/app/weatherCode/weatherCodeInterpretation";

export async function getWeatherSummary(weatherInfo: locationWeather): Promise<string | null> {
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
  const dateStr = new Date(time).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const weatherName = WeatherCodeInterpretator[weatherCode];

  const userContent = `
Here is the weather data for ${locationString} on ${dateStr}:
- Current temperature: ${temperatureNow} C
- Feels like: ${apparentTemperatureNow} C
- High: ${highestTemperature} C / Low: ${lowestTemperature} C
- Wind: ${windSpeed10m} km/h, direction ${windDirection10m}
- Precipitation: ${precipitation} mm
- Chance of rain: ${recipitationProbabilityMax}%
- Sunshine duration: ${sunshineDuration} seconds
- Weather code: ${weatherCode}
- Weather: ${weatherName}

Please summarize this data into a short, natural English sentence suitable for a weather forecast.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a professional weather broadcaster. Given structured weather data, respond with a short, natural-sounding summary in English. Keep it concise, clear, and suitable for the general public",
      },
      {
        role: "user",
        content: userContent,
      },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}
