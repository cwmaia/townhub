const OPEN_METEO_BASE =
  process.env.NEXT_PUBLIC_OPEN_METEO_BASE ??
  "https://api.open-meteo.com/v1/forecast";

export type DailyForecast = {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  icon: string;
};

export type WeatherForecast = {
  temperature: number | null;
  description: string;
  windSpeed: number | null;
  humidity: number | null;
  visibility: number | null;
  icon: string;
  daily: DailyForecast[];
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    relative_humidity_2m?: number;
    visibility?: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
};

const weatherCodeMap: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Light freezing drizzle",
  57: "Freezing drizzle",
  61: "Light rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export const getWeatherForecast = async (
  lat: number,
  lng: number
): Promise<WeatherForecast> => {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: ["temperature_2m", "wind_speed_10m", "weather_code", "relative_humidity_2m", "visibility"].join(","),
    daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"].join(","),
    timezone: "auto",
    forecast_days: "6", // Get 6 days to show 5-day forecast
  });

  try {
    const response = await fetch(`${OPEN_METEO_BASE}?${params.toString()}`, {
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const current = data.current;
    const daily = data.daily;

    if (!current) {
      return {
        temperature: null,
        description: "No data",
        windSpeed: null,
        humidity: null,
        visibility: null,
        icon: "cloud",
        daily: [],
      };
    }

    // Parse daily forecast (skip today, get next 5 days)
    const dailyForecasts: DailyForecast[] = [];
    if (daily && daily.time.length > 1) {
      for (let i = 1; i <= 5 && i < daily.time.length; i++) {
        dailyForecasts.push({
          date: daily.time[i],
          maxTemp: Math.round(daily.temperature_2m_max[i]),
          minTemp: Math.round(daily.temperature_2m_min[i]),
          weatherCode: daily.weather_code[i],
          icon: selectWeatherIcon(daily.weather_code[i]),
        });
      }
    }

    return {
      temperature: current.temperature_2m,
      windSpeed: current.wind_speed_10m,
      humidity: current.relative_humidity_2m ?? null,
      visibility: current.visibility ? Math.round(current.visibility / 1000) : null, // Convert meters to km
      description: weatherCodeMap[current.weather_code] ?? "Weather update",
      icon: selectWeatherIcon(current.weather_code),
      daily: dailyForecasts,
    };
  } catch (error) {
    console.error("Open-Meteo error", error);
    return {
      temperature: null,
      description: "Weather unavailable",
      windSpeed: null,
      humidity: null,
      visibility: null,
      icon: "cloud-off",
      daily: [],
    };
  }
};

const selectWeatherIcon = (code: number) => {
  if ([0].includes(code)) return "sun";
  if ([1, 2, 3].includes(code)) return "cloud-sun";
  if ([45, 48].includes(code)) return "cloud-fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "cloud-rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "cloud-snow";
  if ([95, 96, 99].includes(code)) return "cloud-lightning";
  return "cloud";
};
