import { getWeather } from "@/lib/api/weather";

export async function getWeatherData() {
  // to change this to your location
  const lat = -26.2041; // Johannesburg latitude
  const lon = 28.0473; // Johannesburg longitude

  const weather = await getWeather(lat, lon).catch(() => null);
  const temperature = Math.round(weather?.main?.temp ?? 22);
  const condition = weather?.weather?.[0]?.main ?? "Clear";
  const currentDate = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return {
    currentDate,
    condition,
    temperature,
  };
}
