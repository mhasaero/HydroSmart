// utils/weather.ts

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherResult {
  temp: number;
  condition: string;
  city: string;
  isSuccess: boolean;
  message?: string;
}

export const getWeatherByCoords = async (
  lat: number,
  lon: number
): Promise<WeatherResult> => {
  if (!API_KEY) {
    return {
      temp: 0,
      condition: "API Key Missing",
      city: "Config Error",
      isSuccess: false,
      message: "API Key belum diset di .env",
    };
  }

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=id`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        temp: 0,
        condition: "Error",
        city: "Unknown",
        isSuccess: false,
        message: data.message || "Gagal mengambil data",
      };
    }

    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].description,
      city: data.name,
      isSuccess: true,
    };
  } catch (error) {
    return {
      temp: 0,
      condition: "Offline",
      city: "Network Error",
      isSuccess: false,
      message: "Tidak ada koneksi internet",
    };
  }
};
